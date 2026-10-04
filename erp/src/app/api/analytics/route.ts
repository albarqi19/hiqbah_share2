import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/auth-server";

// Thresholds the dashboard and home screens report against. They are fixed system
// policy, not per-material settings; they travel in the response so a screen can state
// the line it is using instead of repeating the number.
const LOW_STOCK_KG = 50;
const QC_URGENT_HOURS = 6;
const WEEKS_SHOWN = 8;

function isoWeekStart(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const { error } = await requireModule("dashboard");
  if (error) return error;

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd      = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const thirtyDaysAgo     = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // The same number of days at the start of last month, so this month so far can be
  // compared with a period of equal length rather than with a whole month.
  const elapsedMs         = now.getTime() - currentMonthStart.getTime();
  const prevMonthToDateEnd = new Date(Math.min(prevMonthStart.getTime() + elapsedMs, prevMonthEnd.getTime()));

  // The chart covers whole weeks: from the Monday seven weeks before this week's Monday,
  // so the first bar is a full week rather than whatever 56 days back happened to cut.
  const [cy, cm, cd]      = isoWeekStart(now).split("-").map(Number);
  const firstChartWeek    = new Date(cy, cm - 1, cd - 7 * (WEEKS_SHOWN - 1));

  const [
    currentMonthAgg,
    prevMonthAgg,
    prevMonthToDateAgg,
    recentBatches,
    qcGrouped,
    greenBeanAgg,
    fglAgg,
    unitLots,
    weeklyBatches,
    pendingCount,
    inProductionCount,
    readyCount,
    inventoryAlerts,
    recentActiveOrders,
    openQcBatches,
  ] = await Promise.all([
    prisma.roastingBatch.aggregate({
      where: { createdAt: { gte: currentMonthStart }, roastedBeanQuantity: { gt: 0 }, isBlend: false },
      _sum: { roastedBeanQuantity: true, greenBeanQuantity: true },
      _count: { id: true },
    }),
    prisma.roastingBatch.aggregate({
      where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd }, roastedBeanQuantity: { gt: 0 }, isBlend: false },
      _sum: { roastedBeanQuantity: true },
    }),
    prisma.roastingBatch.aggregate({
      where: { createdAt: { gte: prevMonthStart, lte: prevMonthToDateEnd }, roastedBeanQuantity: { gt: 0 }, isBlend: false },
      _sum: { roastedBeanQuantity: true },
    }),
    // Fetch raw batch rows for loss calculation — only 2 float fields, very small payload
    prisma.roastingBatch.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, roastedBeanQuantity: { gt: 0 }, greenBeanQuantity: { gt: 0 }, isBlend: false },
      select: { roastedBeanQuantity: true, greenBeanQuantity: true },
    }),
    prisma.qcRecord.groupBy({
      by: ["decision"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    }),
    prisma.greenBean.aggregate({
      where: { isActive: true },
      _sum: { quantityKg: true },
    }),
    // Finished goods come in two shapes (see FinishedGoodsLot): legacy kg lots, where
    // availableQty is the balance, and unit-tracked lots, where availableQty is frozen at
    // 0 and the balance is unitsAvailable x the SKU's weight. Summing availableQty alone
    // counted none of the unit-tracked stock, which is everything packed since the change.
    prisma.finishedGoodsLot.aggregate({
      where: { status: "AVAILABLE", isUnitTracked: false },
      _sum: { availableQty: true },
    }),
    prisma.finishedGoodsLot.findMany({
      where: { status: "AVAILABLE", isUnitTracked: true, unitsAvailable: { gt: 0 } },
      select: { unitsAvailable: true, productSku: { select: { weightGrams: true } } },
    }),
    // Only 3 fields per batch for chart — minimal payload
    prisma.roastingBatch.findMany({
      where: { createdAt: { gte: firstChartWeek }, roastedBeanQuantity: { gt: 0 }, isBlend: false },
      select: { createdAt: true, roastedBeanQuantity: true, greenBeanQuantity: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.orderItem.count({ where: { productionStatus: "Pending" } }),
    prisma.orderItem.count({ where: { productionStatus: "In Production" } }),
    prisma.orderItem.count({ where: { productionStatus: "Completed", deliveryStatus: { not: "Delivered" } } }),
    prisma.greenBean.findMany({
      where: { quantityKg: { lt: LOW_STOCK_KG }, isActive: true },
      select: { id: true, beanType: true, beanTypeAr: true, country: true, countryAr: true, quantityKg: true },
      orderBy: { quantityKg: "asc" },
    }),
    prisma.order.findMany({
      where: { items: { some: { productionStatus: { not: "Completed" } } } },
      include: {
        customer: { select: { name: true, nameAr: true } },
        items: { select: { productionStatus: true, deliveryStatus: true, quantityKg: true, beanTypeName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.roastingBatch.findMany({
      where: { status: "Pending QC" },
      include: {
        greenBean: true,
        orderItem: { include: { order: { include: { customer: true } } } },
        qcRecords: { select: { id: true, decision: true } },
      },
      orderBy: { qcDeadline: "asc" },
      take: 50,
    }),
  ]);

  // ── Derived KPIs ───────────────────────────────────────────────────────────

  const currentMonthKg = +(currentMonthAgg._sum.roastedBeanQuantity ?? 0).toFixed(1);
  const prevMonthKg    = +(prevMonthAgg._sum.roastedBeanQuantity ?? 0).toFixed(1);
  const productionTrend =
    prevMonthKg > 0 ? +(((currentMonthKg - prevMonthKg) / prevMonthKg) * 100).toFixed(1) : null;
  // Month to date against the same number of days last month — the comparison a reader
  // can act on. productionTrend above compares a partial month with a whole one and is
  // kept only for existing consumers.
  const prevMonthToDateKg = +(prevMonthToDateAgg._sum.roastedBeanQuantity ?? 0).toFixed(1);
  const productionTrendSameDays =
    prevMonthToDateKg > 0 ? +(((currentMonthKg - prevMonthToDateKg) / prevMonthToDateKg) * 100).toFixed(1) : null;

  const unitTrackedKg = unitLots.reduce(
    (s, l) => s + (l.unitsAvailable * (l.productSku?.weightGrams ?? 0)) / 1000, 0,
  );
  const unitLotsWithoutWeight = unitLots.filter((l) => !l.productSku?.weightGrams).length;

  // Weighted average loss (not per-batch average — more accurate)
  let avgLossPct: number | null = null;
  if (recentBatches.length > 0) {
    const totalGreen   = recentBatches.reduce((s, b) => s + b.greenBeanQuantity, 0);
    const totalRoasted = recentBatches.reduce((s, b) => s + b.roastedBeanQuantity, 0);
    avgLossPct = totalGreen > 0 ? +(((totalGreen - totalRoasted) / totalGreen) * 100).toFixed(1) : null;
  }

  const qcPass  = qcGrouped.find((q) => q.decision === "Accept")?._count.id ?? 0;
  const qcFail  = qcGrouped.find((q) => q.decision === "Reject")?._count.id ?? 0;
  const qcTotal = qcPass + qcFail;
  const qcPassRate = qcTotal > 0 ? +(((qcPass / qcTotal) * 100).toFixed(1)) : null;

  // ── Weekly production aggregation ─────────────────────────────────────────

  type WeekEntry = { roastedKg: number; greenKg: number; label: string };
  const weekMap = new Map<string, WeekEntry>();

  for (const batch of weeklyBatches) {
    const key = isoWeekStart(new Date(batch.createdAt));
    const prev = weekMap.get(key) ?? { roastedKg: 0, greenKg: 0, label: "" };
    const d    = new Date(key + "T00:00:00Z");
    weekMap.set(key, {
      roastedKg: +(prev.roastedKg + batch.roastedBeanQuantity).toFixed(1),
      greenKg:   +(prev.greenKg   + batch.greenBeanQuantity).toFixed(1),
      label:     `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
    });
  }

  // Every week in the window is present, in order. A week with no roasts is a real
  // zero — the batches table is complete for it — so it is filled as 0, never skipped:
  // skipping it would squeeze the time axis and make the bars read as consecutive weeks.
  const currentWeekKey = isoWeekStart(now);
  const weeklyProduction = Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const key = isoWeekStart(new Date(firstChartWeek.getFullYear(), firstChartWeek.getMonth(), firstChartWeek.getDate() + 7 * i));
    const d = new Date(key + "T00:00:00Z");
    const entry = weekMap.get(key);
    return {
      weekStart: key,
      label:     `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
      roastedKg: entry?.roastedKg ?? 0,
      greenKg:   entry?.greenKg ?? 0,
      partial:   key === currentWeekKey,
    };
  });

  // ── QC alert shaping ──────────────────────────────────────────────────────

  const qcBatchAlerts = openQcBatches.map((b) => ({
    id:           b.id,
    batchNumber:  b.batchNumber,
    origin:       b.greenBean?.beanType ?? b.orderItem?.beanTypeName ?? "",
    testerCount:  b.qcRecords.length,
    deadline:     b.qcDeadline,
    isOverdue:    b.qcDeadline ? b.qcDeadline < now : false,
    isUrgent:     b.qcDeadline ? b.qcDeadline < new Date(now.getTime() + QC_URGENT_HOURS * 60 * 60 * 1000) : false,
  }));

  return NextResponse.json({
    generatedAt: now.toISOString(),
    policy: { lowStockKg: LOW_STOCK_KG, qcUrgentHours: QC_URGENT_HOURS },
    period: {
      currentMonthStart: currentMonthStart.toISOString(),
      prevMonthStart:    prevMonthStart.toISOString(),
      prevMonthToDateEnd: prevMonthToDateEnd.toISOString(),
      prevMonthEnd:      prevMonthEnd.toISOString(),
    },
    kpi: {
      currentMonthKg,
      prevMonthKg,
      prevMonthToDateKg,
      productionTrend,
      productionTrendSameDays,
      batchCount:       currentMonthAgg._count.id,
      avgLossPct,
      qcPassRate,
      qcPassCount:      qcPass,
      qcTotalCount:     qcTotal,
      rawMaterialKg:    +(greenBeanAgg._sum.quantityKg  ?? 0).toFixed(1),
      finishedGoodsKg:  +((fglAgg._sum.availableQty ?? 0) + unitTrackedKg).toFixed(1),
      finishedGoodsUnitLotsWithoutWeight: unitLotsWithoutWeight,
    },
    weeklyProduction,
    qcBreakdown: [
      { decision: "Accept", count: qcPass },
      { decision: "Reject", count: qcFail },
    ],
    pipeline: {
      pending:         pendingCount,
      inProduction:    inProductionCount,
      readyToDispatch: readyCount,
    },
    inventoryAlerts,
    recentActiveOrders,
    qcBatchAlerts,
  });
}
