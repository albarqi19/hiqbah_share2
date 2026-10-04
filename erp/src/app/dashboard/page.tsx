"use client";

import { useState } from "react";
import { RefreshCw, ShieldAlert, Table2, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useI18n } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/translations";
import { hasModuleAccess } from "@/lib/auth-shared";
import { HQ } from "@/lib/hiqbah-colors";
import {
  fmtNumber, fmtInt, fmtTime, fmtDateTime, fmtMonthYear, dayOfMonth, fmtShortDate,
  hoursUntil, fmtDuration,
} from "@/lib/format";
import { useAnalytics, type AnalyticsData, type QcAlert } from "@/lib/analytics-client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { Panel } from "@/components/ui/Panel";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatusBadge } from "@/components/OrderLifecyclePanel";
import { useUser } from "./user-context";

// ─── Executive dashboard ────────────────────────────────────────────────────
//
// Every figure here states what it measures and over which period, and is compared
// only with a period of the same length. Nothing is coloured good or bad against a
// threshold the business has not set: the loss and pass-rate figures are shown as
// measured. The two thresholds that do exist (the low-stock line and the QC "due soon"
// window) come from the API and are named where they are used.

function signed(n: number, lang: Lang) {
  const s = fmtNumber(Math.abs(n), lang, 1);
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s;
}

function qcTone(b: QcAlert): "danger" | "warning" | "neutral" {
  return b.isOverdue ? "danger" : b.isUrgent ? "warning" : "neutral";
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const user = useUser();
  const { data, state, refreshing, refreshFailed, refresh, retry } = useAnalytics();
  const can = (module: string) => !!user && hasModuleAccess(user.permissions, module);

  if (state === "forbidden") {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white rounded-lg border border-hq-line p-8 text-center">
        <div className="w-12 h-12 rounded-lg bg-hq-neutral flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={22} className="text-hq-ink" aria-hidden="true" />
        </div>
        <h1 className="text-base leading-[26px] font-bold text-hq-ink">{t("noDashboardAccess")}</h1>
        <p className="text-sm leading-6 text-hq-muted mt-1.5">{t("useSidebar")}</p>
      </div>
    );
  }

  const now = data ? new Date(data.generatedAt) : new Date();
  const periodText = `${fmtMonthYear(now, lang)} (1–${dayOfMonth(now)})`;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader
        title={t("execDashTitle")}
        description={t("hqDashDescription")}
        meta={data
          ? `${t("hqPeriod")}: ${periodText} · ${t("hqLastSuccessfulUpdate")}: ${fmtTime(data.generatedAt, lang)} (${t("hqRiyadhTime")})`
          : undefined}
        actions={state === "ready" && (
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 h-9 px-4 bg-hq-primary text-white rounded-md text-sm font-semibold hover:bg-hq-primary-strong transition-colors disabled:opacity-60"
          >
            <RefreshCw size={16} aria-hidden="true" className={refreshing ? "animate-spin" : ""} />
            {refreshing ? t("hqRefreshing") : t("hqRefreshData")}
          </button>
        )}
      />

      {state === "error" && (
        <InlineAlert
          tone="danger"
          title={t("hqDashLoadFailed")}
          action={
            <button type="button" onClick={retry} className="h-9 px-4 bg-white border border-hq-control rounded-md text-sm font-semibold text-hq-ink hover:bg-hq-neutral">
              {t("hqRetry")}
            </button>
          }
        >
          {t("hqDashLoadFailedBody")}
        </InlineAlert>
      )}

      {refreshFailed && data && (
        <InlineAlert tone="warning" title={`${t("hqStaleTitle")} ${fmtTime(data.generatedAt, lang)}`}>
          {t("hqStaleBody")}
        </InlineAlert>
      )}

      {state !== "error" && (
        <>
          <KpiRow data={data} loading={state === "loading"} lang={lang} t={t} periodText={periodText} />

          {data && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <WeeklyProduction data={data} lang={lang} t={t} className="xl:col-span-2" />
                <QcDecisions data={data} lang={lang} t={t} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <Pipeline data={data} lang={lang} t={t} className="xl:col-span-2" />
                <StockOnHand data={data} lang={lang} t={t} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <OpenQc data={data} lang={lang} t={t} canOpen={can("qc")} />
                <LowStock data={data} lang={lang} t={t} canOpen={can("inventory")} />
              </div>

              <ActiveOrders data={data} lang={lang} t={t} canOpen={can("orders")} />
            </>
          )}
        </>
      )}
    </div>
  );
}

type T = ReturnType<typeof useI18n>["t"];
type SectionProps = { data: AnalyticsData; lang: Lang; t: T; className?: string };

// ─── KPIs ───────────────────────────────────────────────────────────────────

function KpiRow({ data, loading, lang, t, periodText }: { data: AnalyticsData | null; loading: boolean; lang: Lang; t: T; periodText: string }) {
  const k = data?.kpi;
  const prevDays = data ? dayOfMonth(data.period.prevMonthToDateEnd) : 0;
  const prevMonth = data ? fmtMonthYear(data.period.prevMonthStart, lang) : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Metric
        loading={loading}
        label={t("productionThisMonth")}
        value={k ? fmtNumber(k.currentMonthKg, lang) : null}
        unit={t("kgUnit")}
        definition={`${t("hqProdDefinition")} · ${periodText} · ${k ? fmtInt(k.batchCount, lang) : "—"} ${t("hqBatches")}`}
        comparison={k && k.productionTrendSameDays !== null ? {
          text: `${signed(k.productionTrendSameDays, lang)}% ${t("hqVsSameDays")} (${prevMonth} 1–${prevDays}: ${fmtNumber(k.prevMonthToDateKg, lang)} ${t("kgUnit")})`,
          tone: k.productionTrendSameDays > 0 ? "positive" : k.productionTrendSameDays < 0 ? "negative" : "neutral",
        } : k ? { text: t("hqNoSameDaysComparison"), tone: "neutral" } : undefined}
      />
      <Metric
        loading={loading}
        label={t("avgRoastLoss")}
        value={k?.avgLossPct != null ? fmtNumber(k.avgLossPct, lang) : null}
        unit="%"
        definition={t("hqLossDefinition")}
        unavailable={t("hqLossUnavailable")}
      />
      <Metric
        loading={loading}
        label={t("qcPassRateLabel")}
        value={k?.qcPassRate != null ? fmtNumber(k.qcPassRate, lang) : null}
        unit="%"
        definition={t("hqQcRateDefinition")}
        comparison={k && k.qcTotalCount > 0 ? {
          text: `${fmtInt(k.qcPassCount, lang)} ${t("hqOf")} ${fmtInt(k.qcTotalCount, lang)} ${t("hqVerdicts")}`,
        } : undefined}
        unavailable={t("hqQcUnavailable")}
      />
    </div>
  );
}

// ─── Weekly production ──────────────────────────────────────────────────────

function WeeklyProduction({ data, lang, t, className }: SectionProps) {
  const { dir } = useI18n();
  const [asTable, setAsTable] = useState(false);
  const weeks = data.weeklyProduction;
  const hasAny = weeks.some((w) => w.roastedKg > 0 || w.greenKg > 0);
  const chartData = weeks.map((w) => ({ ...w, axis: w.partial ? `${w.label}*` : w.label }));

  return (
    <Panel
      className={className}
      title={t("hqWeeklyTitle")}
      meta={`${t("hqUnitKg")} · ${t("hqWeeklyPeriod")} · ${t("hqWeeklySource")} · ${t("hqUpdated")} ${fmtTime(data.generatedAt, lang)}`}
      actions={hasAny && (
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          aria-pressed={asTable}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold text-hq-primary hover:bg-hq-primary-soft"
        >
          {asTable ? <BarChart3 size={16} aria-hidden="true" /> : <Table2 size={16} aria-hidden="true" />}
          {asTable ? t("hqShowChart") : t("hqShowTable")}
        </button>
      )}
      footer={hasAny ? t("hqWeeklyFootnote") : undefined}
    >
      {!hasAny ? (
        <p className="py-12 text-center text-sm text-hq-muted">{t("hqWeeklyEmpty")}</p>
      ) : asTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-hq-ink border-b border-hq-line">
                <th scope="col" className="text-start font-semibold py-2">{t("hqWeekOf")}</th>
                <th scope="col" className="text-end font-semibold py-2">{t("hqGreenIn")} ({t("kgUnit")})</th>
                <th scope="col" className="text-end font-semibold py-2">{t("hqRoastedOut")} ({t("kgUnit")})</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.weekStart} className="border-b border-hq-line last:border-0">
                  <td className="py-2">{fmtShortDate(w.weekStart + "T12:00:00Z", lang)}{w.partial ? ` · ${t("hqWeekSoFar")}` : ""}</td>
                  <td className="py-2 text-end">{fmtNumber(w.greenKg, lang)}</td>
                  <td className="py-2 text-end">{fmtNumber(w.roastedKg, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-4 mb-2 text-xs text-hq-ink">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: HQ.chart2 }} aria-hidden="true" />{t("hqGreenIn")}</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: HQ.chart1 }} aria-hidden="true" />{t("hqRoastedOut")}</span>
          </div>
          <div className="h-64" role="img" aria-label={t("hqWeeklyAria")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4} barCategoryGap="28%" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={HQ.line} vertical={false} />
                <XAxis
                  dataKey="axis"
                  reversed={dir === "rtl"}
                  tick={{ fontSize: 12, fill: HQ.ink }}
                  axisLine={{ stroke: HQ.control }}
                  tickLine={false}
                />
                <YAxis
                  orientation={dir === "rtl" ? "right" : "left"}
                  domain={[0, "auto"]}
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: HQ.muted }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  cursor={{ fill: HQ.neutral }}
                  contentStyle={{ borderRadius: 8, border: `1px solid ${HQ.line}`, fontSize: 12, fontFamily: "inherit" }}
                  labelFormatter={(_, payload) => {
                    const w = payload?.[0]?.payload as (typeof chartData)[number] | undefined;
                    return w ? `${t("hqWeekOf")} ${fmtShortDate(w.weekStart + "T12:00:00Z", lang)}${w.partial ? ` · ${t("hqWeekSoFar")}` : ""}` : "";
                  }}
                  formatter={(value, name) => [`${fmtNumber(Number(value), lang)} ${t("kgUnit")}`, name]}
                />
                <Bar dataKey="greenKg" name={t("hqGreenIn")} fill={HQ.chart2} radius={[3, 3, 0, 0]} />
                <Bar dataKey="roastedKg" name={t("hqRoastedOut")} fill={HQ.chart1} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Panel>
  );
}

// ─── QC decisions ───────────────────────────────────────────────────────────

function QcDecisions({ data, lang, t }: SectionProps) {
  const { qcPassCount: pass, qcTotalCount: total, qcPassRate } = data.kpi;
  const reject = total - pass;
  // The pass share is the API's rounded rate; the reject share is its complement, so the
  // two printed shares always add to exactly 100.0.
  const passPct = qcPassRate ?? 0;
  const rejectPct = total > 0 ? 100 - passPct : 0;
  const slices = [
    { name: t("hqAccepted"), value: pass, pct: passPct, color: HQ.chart1 },
    { name: t("hqRejected"), value: reject, pct: rejectPct, color: HQ.danger },
  ];

  return (
    <Panel
      title={t("hqQcTitle")}
      meta={`${t("hqLast30Days")} · ${t("hqQcSource")}`}
      footer={total > 0 ? `${t("hqTotal")} ${fmtInt(total, lang)} = ${fmtInt(pass, lang)} + ${fmtInt(reject, lang)} · ${t("hqRoundingNote")}` : undefined}
    >
      {total === 0 ? (
        <p className="py-12 text-center text-sm text-hq-muted">{t("hqQcEmpty")}</p>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40" role="img" aria-label={`${t("hqQcTitle")}: ${slices.map((s) => `${s.name} ${s.value}`).join("، ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices.filter((s) => s.value > 0)} dataKey="value" innerRadius="62%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={2} isAnimationActive={false}>
                  {slices.filter((s) => s.value > 0).map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[30px] leading-10 font-semibold text-hq-ink numeric">{fmtInt(total, lang)}</span>
              <span className="text-xs text-hq-muted">{t("hqVerdicts")}</span>
            </div>
          </div>
          <ul className="w-full space-y-2">
            {slices.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} aria-hidden="true" />
                <span className="font-semibold text-hq-ink">{s.name}</span>
                <span className="ms-auto text-xs text-hq-muted numeric">{fmtInt(s.value, lang)} · {fmtNumber(s.pct, lang)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

// ─── Order-line pipeline ────────────────────────────────────────────────────

function Pipeline({ data, lang, t, className }: SectionProps) {
  const { pending, inProduction, readyToDispatch } = data.pipeline;
  const total = pending + inProduction + readyToDispatch;
  const stages = [
    { label: t("hqLinesAwaitingProduction"), value: pending, box: "bg-hq-neutral border-hq-control", fg: "text-hq-ink" },
    { label: t("statusInProd"), value: inProduction, box: "bg-hq-warning-soft border-hq-warning", fg: "text-hq-warning" },
    { label: t("hqLinesReadyToShip"), value: readyToDispatch, box: "bg-hq-primary-soft border-hq-primary", fg: "text-hq-primary" },
  ];
  return (
    <Panel
      className={className}
      title={t("hqPipelineTitle")}
      meta={`${t("hqLive")} · ${t("hqPipelineSource")}`}
      footer={`${fmtInt(total, lang)} ${t("hqOrderLines")} = ${stages.map((s) => fmtInt(s.value, lang)).join(" + ")} · ${t("hqPipelineFootnote")}`}
    >
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stages.map((s) => (
          <li key={s.label} className={`border rounded-lg p-4 text-center ${s.box}`}>
            <p className={`text-[30px] leading-10 font-semibold numeric ${s.fg}`}>{fmtInt(s.value, lang)}</p>
            <p className="text-sm leading-6 font-semibold text-hq-ink">{s.label}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

// ─── Stock on hand ──────────────────────────────────────────────────────────

function StockOnHand({ data, lang, t }: SectionProps) {
  const k = data.kpi;
  return (
    <Panel title={t("hqStockTitle")} meta={`${t("hqLive")} · ${fmtTime(data.generatedAt, lang)}`}>
      <dl className="space-y-4">
        <div>
          <dt className="text-sm leading-6 font-semibold text-hq-ink">{t("hqGreenStock")}</dt>
          <dd className="flex items-baseline gap-1 numeric">
            <span className="text-[30px] leading-10 font-semibold text-hq-ink">{fmtNumber(k.rawMaterialKg, lang)}</span>
            <span className="text-xs text-hq-muted">{t("kgUnit")}</span>
          </dd>
          <dd className="text-xs leading-5 text-hq-muted">{t("hqGreenStockDef")}</dd>
        </div>
        <div className="border-t border-hq-line pt-4">
          <dt className="text-sm leading-6 font-semibold text-hq-ink">{t("hqFinishedStock")}</dt>
          <dd className="flex items-baseline gap-1 numeric">
            <span className="text-[30px] leading-10 font-semibold text-hq-ink">{fmtNumber(k.finishedGoodsKg, lang)}</span>
            <span className="text-xs text-hq-muted">{t("kgUnit")}</span>
          </dd>
          <dd className="text-xs leading-5 text-hq-muted">{t("hqFinishedStockDef")}</dd>
          {k.finishedGoodsUnitLotsWithoutWeight > 0 && (
            <dd className="text-xs leading-5 text-hq-warning mt-1">
              {t("hqLotsWithoutWeight")}: {fmtInt(k.finishedGoodsUnitLotsWithoutWeight, lang)}
            </dd>
          )}
        </div>
        <p className="text-xs leading-5 text-hq-muted">{t("hqStockNotSummed")}</p>
      </dl>
    </Panel>
  );
}

// ─── Open QC batches ────────────────────────────────────────────────────────

const ROWS_SHOWN = 8;

function OpenQc({ data, lang, t, canOpen }: SectionProps & { canOpen: boolean }) {
  const rows = data.qcBatchAlerts;
  const now = new Date(data.generatedAt);
  return (
    <Panel
      flush
      title={t("openQcBatches")}
      meta={`${t("hqOpenQcMeta")} · ${t("hqDueSoonPolicy")} ${data.policy.qcUrgentHours} ${t("hqHours")}`}
      actions={canOpen && <a href="/dashboard/qc" className="text-sm font-semibold text-hq-primary hover:underline">{t("hqOpenModule")} ({fmtInt(rows.length, lang)})</a>}
      footer={rows.length > ROWS_SHOWN ? `${t("hqShowing")} ${ROWS_SHOWN} ${t("hqOf")} ${fmtInt(rows.length, lang)} · ${t("hqSortedByDeadline")}` : t("hqSortedByDeadline")}
    >
      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-hq-muted">{t("hqNoOpenQc")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hq-neutral text-xs text-hq-ink border-y border-hq-line">
                <th scope="col" className="text-start font-semibold px-6 py-2">{t("hqBatch")}</th>
                <th scope="col" className="text-start font-semibold px-3 py-2">{t("hqDeadline")}</th>
                <th scope="col" className="text-start font-semibold px-6 py-2">{t("hqStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, ROWS_SHOWN).map((b) => {
                const left = b.deadline ? hoursUntil(b.deadline, now) : null;
                return (
                  <tr key={b.id} className="border-b border-hq-line last:border-0">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-hq-ink identifier text-start">{b.batchNumber}</p>
                      <p className="text-xs text-hq-muted">{b.origin} · {t("hqVerdictsRecorded")}: {fmtInt(b.testerCount, lang)}</p>
                    </td>
                    <td className="px-3 py-3">
                      {b.deadline && left ? (
                        <>
                          <p className="text-xs text-hq-ink">{fmtDateTime(b.deadline, lang)}</p>
                          <p className={`text-xs ${left.overdue ? "text-hq-danger" : b.isUrgent ? "text-hq-warning" : "text-hq-muted"}`}>
                            {left.overdue ? t("hqOverdueBy") : t("hqTimeLeft")} {fmtDuration(left.minutes, lang)}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-hq-muted">{t("hqNoDeadline")}</p>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge tone={qcTone(b)}>
                        {b.isOverdue ? t("hqOverdue") : b.isUrgent ? t("hqDueSoon") : t("hqAwaitingDecision")}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ─── Low green-bean stock ───────────────────────────────────────────────────

function LowStock({ data, lang, t, canOpen }: SectionProps & { canOpen: boolean }) {
  const rows = data.inventoryAlerts;
  const disp = (en: string, ar: string | null) => (lang === "ar" && ar ? ar : en);
  return (
    <Panel
      flush
      title={t("inventoryAlertsTitle")}
      meta={`${t("hqLowStockMeta")} ${fmtInt(data.policy.lowStockKg, lang)} ${t("kgUnit")} · ${t("hqLowStockPolicy")}`}
      actions={canOpen && <a href="/dashboard/inventory" className="text-sm font-semibold text-hq-primary hover:underline">{t("hqOpenModule")}</a>}
      footer={rows.length > ROWS_SHOWN ? `${t("hqShowing")} ${ROWS_SHOWN} ${t("hqOf")} ${fmtInt(rows.length, lang)} · ${t("hqSortedByQty")}` : t("hqSortedByQty")}
    >
      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-hq-muted">{t("hqNoLowStock")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hq-neutral text-xs text-hq-ink border-y border-hq-line">
                <th scope="col" className="text-start font-semibold px-6 py-2">{t("hqGreenBean")}</th>
                <th scope="col" className="text-end font-semibold px-3 py-2">{t("hqOnHand")} ({t("kgUnit")})</th>
                <th scope="col" className="text-start font-semibold px-6 py-2">{t("hqStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, ROWS_SHOWN).map((a) => (
                <tr key={a.id} className="border-b border-hq-line last:border-0">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-hq-ink">{disp(a.beanType, a.beanTypeAr)}</p>
                    <p className="text-xs text-hq-muted">{disp(a.country, a.countryAr)}</p>
                  </td>
                  <td className="px-3 py-3 text-end font-semibold text-hq-ink numeric">{fmtNumber(a.quantityKg, lang)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge tone={a.quantityKg <= 0 ? "danger" : "warning"}>
                      {a.quantityKg <= 0 ? t("hqOutOfStock") : t("hqBelowLine")}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ─── Active orders ──────────────────────────────────────────────────────────

function ActiveOrders({ data, lang, t, canOpen }: SectionProps & { canOpen: boolean }) {
  const rows = data.recentActiveOrders;
  const disp = (en: string, ar: string | null) => (lang === "ar" && ar ? ar : en);
  return (
    <Panel
      flush
      title={t("activeOrdersTitle")}
      meta={t("hqActiveOrdersMeta")}
      actions={canOpen && <a href="/dashboard/orders" className="text-sm font-semibold text-hq-primary hover:underline">{t("hqOpenModule")}</a>}
    >
      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-hq-muted">{t("noActiveOrders")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hq-neutral text-xs text-hq-ink border-y border-hq-line">
                <th scope="col" className="text-start font-semibold px-6 py-2">{t("hqOrder")}</th>
                <th scope="col" className="text-end font-semibold px-3 py-2">{t("hqQuantity")} ({t("kgUnit")})</th>
                <th scope="col" className="text-start font-semibold px-3 py-2">{t("hqLinesInProduction")}</th>
                <th scope="col" className="text-start font-semibold px-3 py-2">{t("hqCreated")}</th>
                <th scope="col" className="text-start font-semibold px-6 py-2">{t("hqStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const totalKg = o.items.reduce((s, i) => s + i.quantityKg, 0);
                const open = o.items.filter((i) => i.productionStatus !== "Completed").length;
                return (
                  <tr key={o.id} className="border-b border-hq-line last:border-0">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-hq-ink"><bdi className="identifier">#{o.orderNumber}</bdi> · {disp(o.customer.name, o.customer.nameAr)}</p>
                    </td>
                    <td className="px-3 py-3 text-end numeric">{fmtNumber(totalKg, lang)}</td>
                    <td className="px-3 py-3 text-xs text-hq-ink numeric">{fmtInt(open, lang)} {t("hqOf")} {fmtInt(o.items.length, lang)}</td>
                    <td className="px-3 py-3 text-xs text-hq-muted">{fmtShortDate(o.createdAt, lang)}</td>
                    <td className="px-6 py-3"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
