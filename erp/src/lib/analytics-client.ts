"use client";

import { useCallback, useEffect, useState } from "react";

// The /api/analytics response, as read by the dashboard and the home screen.

export type InventoryAlert = {
  id: string; beanType: string; beanTypeAr: string | null;
  country: string; countryAr: string | null; quantityKg: number;
};

export type ActiveOrder = {
  id: string; orderNumber: number; status: string; createdAt: string;
  customer: { name: string; nameAr: string | null };
  items: { productionStatus: string; deliveryStatus: string; quantityKg: number; beanTypeName: string }[];
};

export type QcAlert = {
  id: string; batchNumber: string; origin: string;
  testerCount: number; deadline: string | null; isOverdue: boolean; isUrgent: boolean;
};

export type WeekPoint = {
  weekStart: string; label: string; roastedKg: number; greenKg: number; partial: boolean;
};

export type DayPoint = { date: string; label: string; roastedKg: number; greenKg: number; partial: boolean };

export type PeriodView = {
  from: string; to: string; prevFrom: string; prevTo: string;
  roastedKg: number; greenKg: number; batchCount: number;
  prevRoastedKg: number; trendPct: number | null;
  lossPct: number | null;
  qcPassCount: number; qcRejectCount: number; qcPassRate: number | null;
  series: DayPoint[];
};

export type AnalyticsData = {
  generatedAt: string;
  periods: { week: PeriodView; month: PeriodView };
  policy: { lowStockKg: number; qcUrgentHours: number };
  period: { currentMonthStart: string; prevMonthStart: string; prevMonthToDateEnd: string; prevMonthEnd: string };
  kpi: {
    currentMonthKg: number; prevMonthKg: number; prevMonthToDateKg: number;
    productionTrend: number | null; productionTrendSameDays: number | null; batchCount: number;
    avgLossPct: number | null;
    qcPassRate: number | null; qcPassCount: number; qcTotalCount: number;
    rawMaterialKg: number; finishedGoodsKg: number; finishedGoodsUnitLotsWithoutWeight: number;
  };
  weeklyProduction: WeekPoint[];
  qcBreakdown: { decision: string; count: number }[];
  pipeline: { pending: number; inProduction: number; readyToDispatch: number };
  inventoryAlerts: InventoryAlert[];
  recentActiveOrders: ActiveOrder[];
  qcBatchAlerts: QcAlert[];
};

/**
 * loading   first request in flight — screens keep their layout and show placeholders
 * ready     data present (a refresh may be running on top of it)
 * forbidden the server refused this user — a permission state, not an error
 * error     the request failed — screens say so and offer a retry, never show zeros
 */
export type AnalyticsState = "loading" | "ready" | "forbidden" | "error";

type FetchResult =
  | { kind: "ok"; data: AnalyticsData }
  | { kind: "forbidden" }
  | { kind: "error" };

async function fetchAnalytics(): Promise<FetchResult> {
  try {
    const res = await fetch("/api/analytics", { cache: "no-store" });
    if (res.status === 401 || res.status === 403) return { kind: "forbidden" };
    if (!res.ok) return { kind: "error" };
    return { kind: "ok", data: await res.json() };
  } catch {
    return { kind: "error" };
  }
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [state, setState] = useState<AnalyticsState>("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // First load, and a full retry after a failed first load.
  useEffect(() => {
    let cancelled = false;
    fetchAnalytics().then((r) => {
      if (cancelled) return;
      if (r.kind === "ok") { setData(r.data); setState("ready"); setRefreshFailed(false); }
      else if (r.kind === "forbidden") { setData(null); setState("forbidden"); }
      else setState("error");
    });
    return () => { cancelled = true; };
  }, [attempt]);

  // A refresh keeps the figures already on screen if it fails, and says they are stale.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    const r = await fetchAnalytics();
    if (r.kind === "ok") { setData(r.data); setState("ready"); setRefreshFailed(false); }
    else if (r.kind === "forbidden") { setData(null); setState("forbidden"); }
    else setRefreshFailed(true);
    setRefreshing(false);
  }, []);

  const retry = useCallback(() => {
    setState("loading");
    setAttempt((n) => n + 1);
  }, []);

  return { data, state, refreshing, refreshFailed, refresh, retry };
}
