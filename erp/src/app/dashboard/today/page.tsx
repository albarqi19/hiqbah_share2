"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Lang, TranslationKey } from "@/lib/i18n/translations";
import { hasModuleAccess, hasSubPrivilege } from "@/lib/auth-shared";
import { fmtNumber, fmtInt, fmtTime, fmtDateTime, fmtLongDate, fmtShortDate, hoursUntil, fmtDuration } from "@/lib/format";
import { useAnalytics, type AnalyticsData } from "@/lib/analytics-client";
import { Metric } from "@/components/ui/Metric";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatusBadge } from "@/components/OrderLifecyclePanel";
import { useUser } from "../user-context";

// ─── Operations overview («لوحة التشغيل») ───────────────────────────────────
//
// Laid out after the Hiqbah operations design (Figma, page 01): headline figures on the
// page, one priority line, the orders that need a decision, then stock and QC deadlines.
// Where the design shows money (sales, collections) this screen shows operational
// figures instead: orders carry no prices in the system, and nothing here invents them.

type T = (key: TranslationKey) => string;

type ActionOrder = {
  id: string; orderNumber: number; status: string; createdAt: string;
  customer: { name: string; nameAr: string | null } | null;
  items: { quantityKg: number }[];
};

// Order states that wait on somebody, in the order a supervisor clears them.
const ACTION_STATUSES = ["Ready for Shipping", "Preparing", "Waiting Preparation Review", "Waiting Approval", "On Hold"] as const;
const STATUS_LABEL: Record<(typeof ACTION_STATUSES)[number], TranslationKey> = {
  "Ready for Shipping": "orderStatusReadyForShipping",
  "Preparing": "orderStatusPreparing",
  "Waiting Preparation Review": "orderStatusWaitingPrepReview",
  "Waiting Approval": "orderStatusWaitingApproval",
  "On Hold": "orderStatusOnHold",
};
const ROWS_SHOWN = 8;

function useActionOrders(enabled: boolean) {
  const [orders, setOrders] = useState<ActionOrder[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((all: ActionOrder[]) => {
        if (cancelled) return;
        setOrders(all.filter((o) => (ACTION_STATUSES as readonly string[]).includes(o.status)));
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [enabled]);
  return { orders, failed };
}

export default function OperationsOverview() {
  const { t, lang } = useI18n();
  const user = useUser();
  const { data, state, retry } = useAnalytics();
  const can = (module: string) => !!user && hasModuleAccess(user.permissions, module);
  const canOrders = can("orders");
  const canCreateOrder = !!user && hasSubPrivilege(user.permissions, "orders", "create");
  const { orders, failed: ordersFailed } = useActionOrders(canOrders);

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

  return (
    <div className="space-y-8 max-w-[1180px]">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] leading-10 font-bold text-hq-ink">{t("hqOpsTitle")}</h1>
          <p className="text-sm leading-6 text-hq-muted">{t("hqOpsSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="h-9 px-4 inline-flex items-center bg-white border border-hq-line rounded-md text-sm text-hq-ink">
            {fmtLongDate(now, lang)}
          </p>
          {canCreateOrder && (
            <a href="/dashboard/orders?new=1" className="inline-flex items-center h-9 px-5 bg-hq-primary text-white rounded-md text-sm font-semibold hover:bg-hq-primary-strong transition-colors">
              {t("newOrder")}
            </a>
          )}
        </div>
      </header>

      {state === "error" && (
        <InlineAlert
          tone="danger"
          title={t("hqTodayLoadFailed")}
          action={<button type="button" onClick={retry} className="h-9 px-4 bg-white border border-hq-control rounded-md text-sm font-semibold text-hq-ink hover:bg-hq-neutral">{t("hqRetry")}</button>}
        >
          {t("hqDashLoadFailedBody")}
        </InlineAlert>
      )}

      {state !== "error" && (
        <>
          <HeadlineFigures data={data} loading={state === "loading"} orders={canOrders ? orders : undefined} lang={lang} t={t} />
          {data && <PriorityLine data={data} lang={lang} t={t} can={can} />}
          {canOrders && <OrdersNeedingAction orders={orders} failed={ordersFailed} lang={lang} t={t} updatedAt={data?.generatedAt} />}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <GreenStock data={data} lang={lang} t={t} canOpen={can("inventory")} />
              <QcDeadlines data={data} lang={lang} t={t} canOpen={can("qc")} now={now} />
            </div>
          )}
        </>
      )}

      <p dir="ltr" className="text-xs text-hq-muted text-end">HIQBAH / OPERATIONS</p>
    </div>
  );
}

// ─── Headline figures — on the page, not in cards ───────────────────────────

function HeadlineFigures({ data, loading, orders, lang, t }: {
  data: AnalyticsData | null; loading: boolean; orders: ActionOrder[] | null | undefined; lang: Lang; t: T;
}) {
  const qc = data?.qcBatchAlerts ?? [];
  const overdue = qc.filter((b) => b.isOverdue).length;
  const urgent = qc.filter((b) => !b.isOverdue && b.isUrgent).length;
  const count = (s: string) => orders?.filter((o) => o.status === s).length ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <Metric
        plain
        loading={loading}
        label={t("hqLinesAwaitingProduction")}
        value={data ? fmtInt(data.pipeline.pending, lang) : null}
        unit={t("hqLinesUnit")}
        definition={data ? `${t("statusInProd")} ${fmtInt(data.pipeline.inProduction, lang)} · ${t("hqLinesReadyToShip")} ${fmtInt(data.pipeline.readyToDispatch, lang)}` : ""}
      />
      {orders !== undefined ? (
        <Metric
          plain
          loading={loading || orders === null}
          label={t("hqOrdersNeedingAction")}
          value={orders ? fmtInt(orders.length, lang) : null}
          unit={t("hqOrdersUnit")}
          definition={`${t("orderStatusReadyForShipping")} ${fmtInt(count("Ready for Shipping"), lang)} · ${t("orderStatusPreparing")} ${fmtInt(count("Preparing"), lang)} · ${t("orderStatusWaitingApproval")} ${fmtInt(count("Waiting Approval"), lang)}`}
        />
      ) : (
        <Metric
          plain
          loading={loading}
          label={t("hqCounterStock")}
          value={data ? fmtInt(data.inventoryAlerts.length, lang) : null}
          unit={t("hqItemsUnit")}
          definition={data ? `${t("hqAlertLine")} ${fmtInt(data.policy.lowStockKg, lang)} ${t("kgUnit")}` : ""}
        />
      )}
      <Metric
        plain
        loading={loading}
        label={t("hqCounterQc")}
        value={data ? fmtInt(qc.length, lang) : null}
        unit={t("hqBatchesUnit")}
        definition={`${t("hqPastDeadline")} ${fmtInt(overdue, lang)} · ${t("hqDueSoon")} ${fmtInt(urgent, lang)}`}
      />
    </div>
  );
}

// ─── One priority line ──────────────────────────────────────────────────────

function PriorityLine({ data, lang, t, can }: { data: AnalyticsData; lang: Lang; t: T; can: (m: string) => boolean }) {
  const now = new Date(data.generatedAt);
  const overdue = data.qcBatchAlerts.find((b) => b.isOverdue);
  const empty = data.inventoryAlerts.find((a) => a.quantityKg <= 0);
  const low = data.inventoryAlerts[0];
  const disp = (en: string, ar: string | null) => (lang === "ar" && ar ? ar : en);

  let text: string | null = null;
  let link: { href: string; label: string } | null = null;
  if (overdue && overdue.deadline) {
    text = `${t("hqPriorityToday")}: ${overdue.batchNumber} — ${t("hqQcOverdueBy")} ${fmtDuration(hoursUntil(overdue.deadline, now).minutes, lang)}.`;
    if (can("qc")) link = { href: "/dashboard/qc", label: t("hqOpenQc") };
  } else if (empty) {
    text = `${t("hqPriorityToday")}: ${disp(empty.beanType, empty.beanTypeAr)} — ${t("hqOutOfStockLong")}.`;
    if (can("inventory")) link = { href: "/dashboard/inventory", label: t("hqOpenInventory") };
  } else if (low) {
    text = `${t("hqPriorityToday")}: ${disp(low.beanType, low.beanTypeAr)} — ${t("hqOnHand")} ${fmtNumber(low.quantityKg, lang)} ${t("kgUnit")}, ${t("hqUnderLineOf")} ${fmtInt(data.policy.lowStockKg, lang)} ${t("kgUnit")}.`;
    if (can("inventory")) link = { href: "/dashboard/inventory", label: t("hqOpenInventory") };
  }
  if (!text) return null;

  return (
    <div role="status" className="flex items-center justify-between gap-4 flex-wrap bg-hq-warning-soft rounded-md px-4 py-3">
      <p className="text-sm leading-6 text-hq-warning">{text}</p>
      {link && (
        <a href={link.href} className="inline-flex items-center gap-1 text-sm font-semibold text-hq-warning hover:underline">
          {link.label} <ArrowLeft size={14} aria-hidden="true" className="ltr:rotate-180" />
        </a>
      )}
    </div>
  );
}

// ─── Orders that need a decision ────────────────────────────────────────────

function OrdersNeedingAction({ orders, failed, lang, t, updatedAt }: {
  orders: ActionOrder[] | null; failed: boolean; lang: Lang; t: T; updatedAt?: string;
}) {
  const [tab, setTab] = useState<string>("all");
  const tabs = ACTION_STATUSES
    .map((s) => ({ s, n: orders?.filter((o) => o.status === s).length ?? 0 }))
    .filter((x) => x.n > 0);
  const shown = (orders ?? [])
    .filter((o) => tab === "all" || o.status === tab)
    .sort((a, b) =>
      ACTION_STATUSES.indexOf(a.status as (typeof ACTION_STATUSES)[number]) - ACTION_STATUSES.indexOf(b.status as (typeof ACTION_STATUSES)[number])
      || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const totalKg = shown.reduce((s, o) => s + o.items.reduce((x, i) => x + i.quantityKg, 0), 0);
  const disp = (c: ActionOrder["customer"]) => (c ? (lang === "ar" && c.nameAr ? c.nameAr : c.name) : "—");

  return (
    <section aria-labelledby="orders-needing-action" className="bg-white border border-hq-line rounded-lg">
      <div className="flex items-center justify-between gap-3 flex-wrap px-6 pt-5 pb-3">
        <h2 id="orders-needing-action" className="text-base leading-[26px] font-bold text-hq-ink">{t("hqOrdersNeedingAction")}</h2>
        <a href="/dashboard/orders" className="inline-flex items-center h-9 px-4 bg-white border border-hq-control rounded-md text-sm font-semibold text-hq-ink hover:bg-hq-neutral">
          {t("hqAllOrders")}
        </a>
      </div>

      {failed ? (
        <p className="px-6 pb-6 text-sm text-hq-danger">{t("hqOrdersLoadFailed")}</p>
      ) : orders === null ? (
        <div className="px-6 pb-6 space-y-2" aria-hidden="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded bg-hq-neutral animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-hq-muted">{t("hqNoOrdersNeedingAction")}</p>
      ) : (
        <>
          <div role="group" aria-label={t("hqFilterByStatus")} className="relative flex items-center gap-6 px-6 border-b border-hq-line overflow-x-auto">
            {[{ s: "all", n: orders.length }, ...tabs].map(({ s, n }) => (
              <button
                key={s}
                type="button"
                aria-pressed={tab === s}
                onClick={() => setTab(s)}
                className={`h-10 -mb-px border-b-2 text-sm whitespace-nowrap transition-colors ${
                  tab === s ? "border-hq-primary text-hq-primary font-bold" : "border-transparent text-hq-ink hover:text-hq-primary"
                }`}
              >
                {s === "all" ? t("hqAll") : t(STATUS_LABEL[s as (typeof ACTION_STATUSES)[number]])} <span className="numeric">{fmtInt(n, lang)}</span>
              </button>
            ))}
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-hq-neutral text-xs text-hq-ink">
                  <th scope="col" className="text-start font-semibold px-6 py-2">{t("hqOrder")}</th>
                  <th scope="col" className="text-start font-semibold px-3 py-2">{t("hqCustomer")}</th>
                  <th scope="col" className="text-end font-semibold px-3 py-2">{t("hqQuantity")} ({t("kgUnit")})</th>
                  <th scope="col" className="text-end font-semibold px-3 py-2">{t("hqLines")}</th>
                  <th scope="col" className="text-start font-semibold px-3 py-2">{t("hqCreated")}</th>
                  <th scope="col" className="text-start font-semibold px-3 py-2">{t("hqStatus")}</th>
                  <th scope="col" className="text-start font-semibold px-6 py-2"><span className="sr-only">{t("hqAction")}</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.slice(0, ROWS_SHOWN).map((o) => (
                  <tr key={o.id} className="border-b border-hq-line last:border-0 h-11">
                    <td className="px-6 py-2"><bdi className="identifier text-hq-muted">#{o.orderNumber}</bdi></td>
                    <td className="px-3 py-2 font-semibold text-hq-ink">{disp(o.customer)}</td>
                    <td className="px-3 py-2 text-end numeric">{fmtNumber(o.items.reduce((x, i) => x + i.quantityKg, 0), lang)}</td>
                    <td className="px-3 py-2 text-end numeric">{fmtInt(o.items.length, lang)}</td>
                    <td className="px-3 py-2 text-hq-muted">{fmtShortDate(o.createdAt, lang)}</td>
                    <td className="px-3 py-2"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-6 py-2">
                      <a href={`/dashboard/orders?order=${o.id}`} className="text-sm font-semibold text-hq-primary hover:underline">
                        {t("hqView")}<span className="sr-only"> #{o.orderNumber}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap px-6 py-3 border-t border-hq-line text-xs text-hq-muted">
            <span>
              {shown.length > ROWS_SHOWN ? `${t("hqShowing")} ${fmtInt(ROWS_SHOWN, lang)} ${t("hqOf")} ` : ""}
              {fmtInt(shown.length, lang)} {t("hqOrdersUnit")} · {fmtNumber(totalKg, lang)} {t("kgUnit")} {t("hqTotalQuantity")} · {t("hqOldestFirst")}
            </span>
            {updatedAt && <span>{t("hqLastUpdate")} {fmtTime(updatedAt, lang)}</span>}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Two cards: green coffee and QC deadlines ───────────────────────────────

function CardHead({ title, link }: { title: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3">
      <h2 className="text-base leading-[26px] font-bold text-hq-ink">{title}</h2>
      {link && (
        <a href={link.href} className="inline-flex items-center gap-1 text-xs font-semibold text-hq-primary hover:underline">
          {link.label} <ArrowLeft size={12} aria-hidden="true" className="ltr:rotate-180" />
        </a>
      )}
    </div>
  );
}

function GreenStock({ data, lang, t, canOpen }: { data: AnalyticsData; lang: Lang; t: T; canOpen: boolean }) {
  const rows = data.inventoryAlerts.slice(0, 5);
  const disp = (en: string, ar: string | null) => (lang === "ar" && ar ? ar : en);
  return (
    <section className="bg-white border border-hq-line rounded-lg">
      <CardHead title={t("hqGreenContinuity")} link={canOpen ? { href: "/dashboard/inventory", label: t("hqViewInventory") } : undefined} />
      {rows.length === 0 ? (
        <p className="px-6 pb-5 text-sm text-hq-muted">{t("hqNoLowStock")}</p>
      ) : (
        <ul className="px-6 pb-4">
          {rows.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-2.5 border-b border-hq-line last:border-0">
              <span className="flex-1 text-sm font-semibold text-hq-ink">{disp(a.beanType, a.beanTypeAr)}</span>
              <span className="text-sm text-hq-ink numeric">{fmtNumber(a.quantityKg, lang)} {t("kgUnit")}</span>
              <StatusBadge tone={a.quantityKg <= 0 ? "danger" : "warning"}>{a.quantityKg <= 0 ? t("hqOutOfStock") : t("hqBelowLine")}</StatusBadge>
            </li>
          ))}
        </ul>
      )}
      <dl className="mx-6 mb-3 grid grid-cols-2 gap-4 border-t border-hq-line pt-3">
        <div>
          <dt className="text-xs text-hq-muted">{t("hqGreenStock")}</dt>
          <dd className="text-sm font-semibold text-hq-ink numeric">{fmtNumber(data.kpi.rawMaterialKg, lang)} {t("kgUnit")}</dd>
        </div>
        <div>
          <dt className="text-xs text-hq-muted">{t("hqFinishedStock")}</dt>
          <dd className="text-sm font-semibold text-hq-ink numeric">{fmtNumber(data.kpi.finishedGoodsKg, lang)} {t("kgUnit")}</dd>
        </div>
      </dl>
      <p className="px-6 pb-4 text-xs text-hq-muted">{t("hqAlertLine")} {fmtInt(data.policy.lowStockKg, lang)} {t("kgUnit")} · {t("hqLowStockPolicy")} · {t("hqStockNotSummed")}</p>
    </section>
  );
}

function QcDeadlines({ data, lang, t, canOpen, now }: { data: AnalyticsData; lang: Lang; t: T; canOpen: boolean; now: Date }) {
  const rows = data.qcBatchAlerts.slice(0, 5);
  return (
    <section className="bg-white border border-hq-line rounded-lg">
      <CardHead title={t("hqQcDeadlines")} link={canOpen ? { href: "/dashboard/qc", label: t("hqViewQc") } : undefined} />
      {rows.length === 0 ? (
        <p className="px-6 pb-5 text-sm text-hq-muted">{t("hqNoOpenQc")}</p>
      ) : (
        <ul className="px-6 pb-4">
          {rows.map((b) => {
            const left = b.deadline ? hoursUntil(b.deadline, now) : null;
            return (
              <li key={b.id} className="flex items-center gap-3 py-2.5 border-b border-hq-line last:border-0">
                <span className="flex-1 min-w-0">
                  <bdi className="identifier block text-sm font-semibold text-hq-ink text-start">{b.batchNumber}</bdi>
                  <span className="block text-xs text-hq-muted">{b.origin}</span>
                </span>
                <span className="text-xs text-end">
                  <span className="block text-hq-ink">{b.deadline ? fmtDateTime(b.deadline, lang) : t("hqNoDeadline")}</span>
                  {left && (
                    <span className={`block ${left.overdue ? "text-hq-danger" : b.isUrgent ? "text-hq-warning" : "text-hq-muted"}`}>
                      {left.overdue ? t("hqOverdueBy") : t("hqTimeLeft")} {fmtDuration(left.minutes, lang)}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="px-6 pb-4 text-xs text-hq-muted">
        {data.qcBatchAlerts.length > rows.length ? `${t("hqShowing")} ${fmtInt(rows.length, lang)} ${t("hqOf")} ${fmtInt(data.qcBatchAlerts.length, lang)} · ` : ""}
        {t("hqSortedByDeadline")} · {t("hqDueSoonPolicy")} {fmtInt(data.policy.qcUrgentHours, lang)} {t("hqHours")}
      </p>
    </section>
  );
}
