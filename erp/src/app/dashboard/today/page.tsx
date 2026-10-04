"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle, ClipboardCheck, Package, ShoppingCart, Factory, Box, Truck, ShieldAlert,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/translations";
import { ROLE_LABELS, hasModuleAccess } from "@/lib/auth-shared";
import {
  fmtNumber, fmtInt, fmtTime, fmtDateTime, fmtLongDate, fmtShortDate, hoursUntil, fmtDuration,
} from "@/lib/format";
import { useAnalytics, type AnalyticsData } from "@/lib/analytics-client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metric } from "@/components/ui/Metric";
import { Panel } from "@/components/ui/Panel";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { OrderStatusBadge } from "@/components/OrderLifecyclePanel";
import { useUser } from "../user-context";

// ─── Home: what needs action now ────────────────────────────────────────────
//
// Built only from the analytics feed the dashboard already uses, so it shows nothing
// the dashboard permission does not already cover. Orders carry no due date in the
// system, so order rows show when the order was raised — never an invented deadline.
// A link to a module is shown only to someone who can open that module.

type T = ReturnType<typeof useI18n>["t"];

// The API returns at most this many open QC batches.
const QC_FEED_CAP = 50;
const ROWS_SHOWN = 10;

type Intervention = {
  key: string;
  rank: number;
  tone: "danger" | "warning" | "neutral";
  icon: React.ElementType;
  title: ReactNode;
  meta: string;
  when: { primary: string; secondary?: string; secondaryTone?: "danger" | "warning" | "muted" };
  badge: ReactNode;
  action?: { href: string; label: string };
};

function buildInterventions(data: AnalyticsData, lang: Lang, t: T, can: (m: string) => boolean): Intervention[] {
  const now = new Date(data.generatedAt);
  const disp = (en: string, ar: string | null) => (lang === "ar" && ar ? ar : en);
  const items: Intervention[] = [];

  data.qcBatchAlerts.forEach((b, i) => {
    const left = b.deadline ? hoursUntil(b.deadline, now) : null;
    const tone: Intervention["tone"] = b.isOverdue ? "danger" : b.isUrgent ? "warning" : "neutral";
    items.push({
      key: `qc-${b.id}`,
      rank: (b.isOverdue ? 0 : b.isUrgent ? 1 : 3) * 1000 + i,
      tone,
      icon: ClipboardCheck,
      title: <><bdi className="identifier">{b.batchNumber}</bdi> · {b.origin}</>,
      meta: `${t("hqAwaitingQcDecision")} · ${t("hqVerdictsRecorded")}: ${fmtInt(b.testerCount, lang)}`,
      when: b.deadline && left
        ? {
            primary: fmtDateTime(b.deadline, lang),
            secondary: `${left.overdue ? t("hqOverdueBy") : t("hqTimeLeft")} ${fmtDuration(left.minutes, lang)}`,
            secondaryTone: left.overdue ? "danger" : b.isUrgent ? "warning" : "muted",
          }
        : { primary: t("hqNoDeadline") },
      badge: <StatusBadge tone={tone}>{b.isOverdue ? t("hqOverdue") : b.isUrgent ? t("hqDueSoon") : t("hqAwaitingDecision")}</StatusBadge>,
      action: can("qc") ? { href: "/dashboard/qc", label: t("hqOpenQc") } : undefined,
    });
  });

  data.inventoryAlerts.forEach((a, i) => {
    const empty = a.quantityKg <= 0;
    items.push({
      key: `stock-${a.id}`,
      rank: (empty ? 2 : 4) * 1000 + i,
      tone: empty ? "danger" : "warning",
      icon: Package,
      title: disp(a.beanType, a.beanTypeAr),
      meta: `${disp(a.country, a.countryAr)} · ${t("hqOnHand")} ${fmtNumber(a.quantityKg, lang)} ${t("kgUnit")} · ${t("hqAlertLine")} ${fmtInt(data.policy.lowStockKg, lang)} ${t("kgUnit")}`,
      when: { primary: t("hqNoDeadline") },
      badge: <StatusBadge tone={empty ? "danger" : "warning"}>{empty ? t("hqOutOfStock") : t("hqBelowLine")}</StatusBadge>,
      action: can("inventory") ? { href: "/dashboard/inventory", label: t("hqOpenInventory") } : undefined,
    });
  });

  data.recentActiveOrders.forEach((o, i) => {
    const totalKg = o.items.reduce((s, it) => s + it.quantityKg, 0);
    const open = o.items.filter((it) => it.productionStatus !== "Completed").length;
    items.push({
      key: `order-${o.id}`,
      rank: 5 * 1000 + i,
      tone: "neutral",
      icon: ShoppingCart,
      title: <><bdi className="identifier">#{o.orderNumber}</bdi> · {disp(o.customer.name, o.customer.nameAr)}</>,
      meta: `${fmtNumber(totalKg, lang)} ${t("kgUnit")} · ${t("hqLinesInProduction")}: ${fmtInt(open, lang)} ${t("hqOf")} ${fmtInt(o.items.length, lang)}`,
      when: { primary: `${t("hqRaised")} ${fmtShortDate(o.createdAt, lang)}`, secondary: t("hqNoDueDate"), secondaryTone: "muted" },
      badge: <OrderStatusBadge status={o.status} />,
      action: can("orders") ? { href: "/dashboard/orders", label: t("hqOpenOrders") } : undefined,
    });
  });

  return items.sort((a, b) => a.rank - b.rank);
}

const CHIP: Record<Intervention["tone"], string> = {
  danger: "bg-hq-danger-soft text-hq-danger",
  warning: "bg-hq-warning-soft text-hq-warning",
  neutral: "bg-hq-neutral text-hq-ink",
};
const WHEN_TONE = { danger: "text-hq-danger", warning: "text-hq-warning", muted: "text-hq-muted" } as const;

export default function TodayPage() {
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
  const interventions = data ? buildInterventions(data, lang, t, can) : [];
  const qcCount = data?.qcBatchAlerts.length ?? 0;
  const qcOverdue = data?.qcBatchAlerts.filter((b) => b.isOverdue).length ?? 0;

  const actions = (
    <>
      {can("orders") && (
        <a href="/dashboard/workstation/preparation" className="inline-flex items-center h-9 px-4 bg-white border border-hq-control rounded-md text-sm font-semibold text-hq-ink hover:bg-hq-neutral transition-colors">
          {t("workstationPreparation")}
        </a>
      )}
      {can("production") && (
        <a href="/dashboard/production" className="inline-flex items-center h-9 px-4 bg-hq-primary text-white rounded-md text-sm font-semibold hover:bg-hq-primary-strong transition-colors">
          {t("hqRecordRoast")}
        </a>
      )}
    </>
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader
        title={t("hqTodayTitle")}
        description={t("hqTodayDescription")}
        meta={`${fmtLongDate(now, lang)} · ${fmtTime(now, lang)} (${t("hqRiyadhTime")})${user ? ` · ${ROLE_LABELS[user.role] || user.role}` : ""}`}
        actions={actions}
      />

      {state === "error" && (
        <InlineAlert
          tone="danger"
          title={t("hqTodayLoadFailed")}
          action={<button type="button" onClick={retry} className="h-9 px-4 bg-white border border-hq-control rounded-md text-sm font-semibold text-hq-ink hover:bg-hq-neutral">{t("hqRetry")}</button>}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Metric
              loading={state === "loading"}
              label={t("hqCounterQc")}
              value={data ? `${fmtInt(qcCount, lang)}${qcCount >= QC_FEED_CAP ? "+" : ""}` : null}
              unit={t("hqBatchesUnit")}
              definition={t("hqCounterQcDef")}
              comparison={data ? { text: `${t("hqPastDeadline")}: ${fmtInt(qcOverdue, lang)}`, tone: qcOverdue > 0 ? "negative" : "neutral" } : undefined}
            />
            <Metric
              loading={state === "loading"}
              label={t("hqLinesAwaitingProduction")}
              value={data ? fmtInt(data.pipeline.pending, lang) : null}
              unit={t("hqLinesUnit")}
              definition={t("hqCounterLinesDef")}
              comparison={data ? { text: `${t("statusInProd")}: ${fmtInt(data.pipeline.inProduction, lang)}` } : undefined}
            />
            <Metric
              loading={state === "loading"}
              label={t("hqCounterStock")}
              value={data ? fmtInt(data.inventoryAlerts.length, lang) : null}
              unit={t("hqItemsUnit")}
              definition={data ? `${t("hqCounterStockDef")} ${fmtInt(data.policy.lowStockKg, lang)} ${t("kgUnit")}` : t("hqCounterStockDef")}
              comparison={data ? { text: t("hqCounterStockNote") } : undefined}
            />
          </div>

          {data && (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_344px] gap-6 items-start">
              <Panel
                flush
                title={t("hqInterventionsTitle")}
                meta={`${t("hqInterventionsMeta")} · ${t("hqUpdated")} ${fmtTime(data.generatedAt, lang)}`}
                actions={
                  <button type="button" onClick={refresh} disabled={refreshing} className="h-9 px-3 rounded-md text-sm font-semibold text-hq-primary hover:bg-hq-primary-soft disabled:opacity-60">
                    {refreshing ? t("hqRefreshing") : t("hqRefreshData")}
                  </button>
                }
                footer={interventions.length > 0
                  ? `${t("hqShowing")} ${fmtInt(Math.min(ROWS_SHOWN, interventions.length), lang)} ${t("hqOf")} ${fmtInt(interventions.length, lang)} · ${t("hqInterventionsOrder")}`
                  : undefined}
              >
                {interventions.length === 0 ? (
                  <div className="px-6 pb-8 pt-2 text-center">
                    <p className="text-base leading-[26px] font-bold text-hq-ink">{t("hqNoInterventions")}</p>
                    <p className="text-xs leading-5 text-hq-muted mt-1">{t("hqNoInterventionsBody")} {fmtTime(data.generatedAt, lang)}</p>
                  </div>
                ) : (
                  <ul className="border-t border-hq-line">
                    {interventions.slice(0, ROWS_SHOWN).map((it) => (
                      <li key={it.key} className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-hq-line last:border-0">
                        <span className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${CHIP[it.tone]}`}>
                          {it.tone === "danger" ? <AlertTriangle size={20} aria-hidden="true" /> : <it.icon size={20} aria-hidden="true" />}
                        </span>
                        <div className="flex-1 min-w-[180px]">
                          <p className="text-sm leading-6 font-semibold text-hq-ink">{it.title}</p>
                          <p className="text-xs leading-5 text-hq-muted">{it.meta}</p>
                        </div>
                        <div className="w-[176px] flex-shrink-0">
                          <p className="text-xs leading-5 text-hq-ink">{it.when.primary}</p>
                          {it.when.secondary && <p className={`text-xs leading-5 ${WHEN_TONE[it.when.secondaryTone ?? "muted"]}`}>{it.when.secondary}</p>}
                        </div>
                        <div className="flex-shrink-0">{it.badge}</div>
                        {it.action ? (
                          <a href={it.action.href} className="flex-shrink-0 inline-flex items-center h-9 px-3 rounded-md text-sm font-semibold text-hq-primary hover:bg-hq-primary-soft">
                            {it.action.label}
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <QuickAccess data={data} lang={lang} t={t} can={can} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QuickAccess({ data, lang, t, can }: { data: AnalyticsData; lang: Lang; t: T; can: (m: string) => boolean }) {
  const tiles: { module: string; href: string; icon: React.ElementType; label: string; note?: string; tone?: BadgeTone }[] = [
    { module: "orders", href: "/dashboard/orders", icon: ShoppingCart, label: t("orders") },
    { module: "production", href: "/dashboard/production", icon: Factory, label: t("production"), note: `${fmtInt(data.pipeline.pending, lang)} ${t("hqLinesAwaitingShort")}` },
    { module: "qc", href: "/dashboard/qc", icon: ClipboardCheck, label: t("qc"), note: `${fmtInt(data.qcBatchAlerts.length, lang)}${data.qcBatchAlerts.length >= QC_FEED_CAP ? "+" : ""} ${t("hqAwaitingDecisionShort")}` },
    { module: "inventory", href: "/dashboard/inventory", icon: Package, label: t("inventory"), note: `${fmtInt(data.inventoryAlerts.length, lang)} ${t("hqBelowLineShort")}` },
    { module: "packaging", href: "/dashboard/packaging", icon: Box, label: t("packaging") },
    { module: "dispatch", href: "/dashboard/dispatch", icon: Truck, label: t("dispatch"), note: `${fmtInt(data.pipeline.readyToDispatch, lang)} ${t("hqReadyShort")}` },
  ].filter((tile) => can(tile.module));

  if (tiles.length === 0) return null;

  return (
    <Panel title={t("hqQuickAccess")} meta={t("hqQuickAccessMeta")}>
      <ul className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <li key={tile.module}>
            <a href={tile.href} className="flex flex-col gap-1 p-3 h-full bg-white border border-hq-line rounded-lg hover:border-hq-control transition-colors">
              <tile.icon size={20} className="text-hq-primary" aria-hidden="true" />
              <span className="text-sm leading-6 font-semibold text-hq-ink">{tile.label}</span>
              {tile.note && <span className="text-xs leading-5 text-hq-muted">{tile.note}</span>}
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
