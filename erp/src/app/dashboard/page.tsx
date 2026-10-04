"use client";

import { useState } from "react";
import { ShieldAlert, Table2, LineChart as LineIcon } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useI18n } from "@/lib/i18n/context";
import type { Lang, TranslationKey } from "@/lib/i18n/translations";
import { HQ } from "@/lib/hiqbah-colors";
import { fmtNumber, fmtInt, fmtTime, fmtShortDate } from "@/lib/format";
import { useAnalytics, type PeriodView, type DayPoint } from "@/lib/analytics-client";
import { Metric } from "@/components/ui/Metric";
import { InlineAlert } from "@/components/ui/InlineAlert";

// ─── Performance in figures («الأداء بالأرقام») ─────────────────────────────
//
// Laid out after the Hiqbah analytics design (Figma, page 01): a period switch, three
// headline figures, a trend line you can tap for a value, a composition donut, paired
// bars and a short reading of the period. The design's money series (sales, collections,
// channels) have no source in the system — orders carry no prices — so the same slots
// show production and quality, which do. Switching the period changes every figure and
// chart together; each period is compared only with an equal stretch of time before it.

type T = (key: TranslationKey) => string;
type PeriodKey = "week" | "month";

const dayDate = (p: DayPoint) => p.date + "T12:00:00Z";

function signed(n: number, lang: Lang) {
  const s = fmtNumber(Math.abs(n), lang, 1);
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s;
}

export default function PerformancePage() {
  const { t, lang, dir } = useI18n();
  const { data, state, refreshing, refreshFailed, refresh, retry } = useAnalytics();
  const [period, setPeriod] = useState<PeriodKey>("week");
  const [selected, setSelected] = useState<number | null>(null);

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

  const view = data?.periods[period] ?? null;
  const series = view?.series ?? [];
  const sel = series.length ? Math.min(selected ?? series.length - 1, series.length - 1) : null;
  const choose = (p: PeriodKey) => { setPeriod(p); setSelected(null); };

  return (
    <div className="space-y-8 max-w-[1180px]">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] leading-10 font-bold text-hq-ink">{t("hqPerfTitle")}</h1>
          <p className="text-sm leading-6 text-hq-muted">{t("hqPerfSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {view && (
            <p className="text-xs text-hq-muted numeric">
              {fmtShortDate(view.from, lang)} – {fmtShortDate(view.to, lang)} · {t("hqLastSuccessfulUpdate")} {fmtTime(data!.generatedAt, lang)}
            </p>
          )}
          <div role="group" aria-label={t("hqPeriod")} className="flex gap-2">
            {(["week", "month"] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => choose(p)}
                className={`h-9 px-4 rounded-md text-sm font-semibold transition-colors ${
                  period === p ? "bg-hq-primary text-white" : "bg-white border border-hq-control text-hq-ink hover:bg-hq-neutral"
                }`}
              >
                {p === "week" ? t("hqLast7Days") : t("hqThisMonth")}
              </button>
            ))}
          </div>
          {state === "ready" && (
            <button type="button" onClick={refresh} disabled={refreshing} className="h-9 px-3 rounded-md text-sm font-semibold text-hq-primary hover:bg-hq-primary-soft disabled:opacity-60">
              {refreshing ? t("hqRefreshing") : t("hqRefreshData")}
            </button>
          )}
        </div>
      </header>

      {state === "error" && (
        <InlineAlert
          tone="danger"
          title={t("hqDashLoadFailed")}
          action={<button type="button" onClick={retry} className="h-9 px-4 bg-white border border-hq-control rounded-md text-sm font-semibold text-hq-ink hover:bg-hq-neutral">{t("hqRetry")}</button>}
        >
          {t("hqDashLoadFailedBody")}
        </InlineAlert>
      )}
      {refreshFailed && data && (
        <InlineAlert tone="warning" title={`${t("hqStaleTitle")} ${fmtTime(data.generatedAt, lang)}`}>{t("hqStaleBody")}</InlineAlert>
      )}

      {state !== "error" && (
        <>
          <Headline view={view} loading={state === "loading"} period={period} lang={lang} t={t} />

          {view && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <Trend className="xl:col-span-2" view={view} sel={sel} onSelect={setSelected} period={period} lang={lang} t={t} dir={dir} />
                <Verdicts view={view} lang={lang} t={t} />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <InOut className="xl:col-span-2" view={view} sel={sel} onSelect={setSelected} lang={lang} t={t} dir={dir} />
                <QuickRead view={view} period={period} lang={lang} t={t} />
              </div>
            </>
          )}
        </>
      )}

      <p dir="ltr" className="text-xs text-hq-muted text-end">HIQBAH / ANALYTICS</p>
    </div>
  );
}

// ─── Headline figures ───────────────────────────────────────────────────────

function Headline({ view, loading, period, lang, t }: { view: PeriodView | null; loading: boolean; period: PeriodKey; lang: Lang; t: T }) {
  const cmpBasis = period === "week" ? t("hqVsPrev7Days") : t("hqVsSameDays");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <Metric
        plain
        loading={loading}
        label={`${t("hqRoastedOutput")} · ${t("kgUnit")}`}
        value={view ? fmtNumber(view.roastedKg, lang) : null}
        definition={view ? `${fmtInt(view.batchCount, lang)} ${t("hqBatches")} · ${t("hqSingleOriginCompleted")}` : ""}
        comparison={view ? (view.trendPct !== null
          ? { text: `${signed(view.trendPct, lang)}% ${cmpBasis} (${fmtNumber(view.prevRoastedKg, lang)} ${t("kgUnit")})`, tone: view.trendPct > 0 ? "positive" : view.trendPct < 0 ? "negative" : "neutral" }
          : { text: t("hqNoComparableBatches") }) : undefined}
      />
      <Metric
        plain
        loading={loading}
        label={`${t("avgRoastLoss")} · %`}
        value={view?.lossPct != null ? fmtNumber(view.lossPct, lang) : null}
        definition={t("hqLossBasisShort")}
        unavailable={t("hqNoBatchesInPeriod")}
      />
      <Metric
        plain
        loading={loading}
        label={`${t("qcPassRateLabel")} · %`}
        value={view?.qcPassRate != null ? fmtNumber(view.qcPassRate, lang) : null}
        definition={view ? `${fmtInt(view.qcPassCount, lang)} ${t("hqOf")} ${fmtInt(view.qcPassCount + view.qcRejectCount, lang)} ${t("hqVerdicts")} · ${t("hqAcceptOverAll")}` : ""}
        unavailable={t("hqNoVerdictsInPeriod")}
      />
    </div>
  );
}

// ─── Card frame ─────────────────────────────────────────────────────────────

function Card({ title, meta, action, className = "", children }: { title: string; meta?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`bg-white border border-hq-line rounded-lg p-6 min-w-0 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-base leading-[26px] font-bold text-hq-ink">{title}</h2>
          {meta && <p className="text-xs leading-5 text-hq-muted">{meta}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Strip({ children }: { children: React.ReactNode }) {
  return <p role="status" className="mt-3 px-4 py-2 rounded-md bg-hq-primary-soft text-sm text-hq-ink numeric">{children}</p>;
}

const axisLabel = (p: DayPoint) => (p.partial ? `${p.label}*` : p.label);

// ─── Trend (line) ───────────────────────────────────────────────────────────

function Trend({ view, sel, onSelect, period, lang, t, dir, className }: {
  view: PeriodView; sel: number | null; onSelect: (i: number) => void; period: PeriodKey; lang: Lang; t: T; dir: "ltr" | "rtl"; className?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  const data = view.series.map((p) => ({ ...p, axis: axisLabel(p) }));
  const hasAny = view.series.some((p) => p.roastedKg > 0);
  const point = sel !== null ? view.series[sel] : null;

  return (
    <Card
      className={className}
      title={t("hqProductionTrend")}
      meta={`${t("hqUnitKg")} · ${period === "week" ? t("hqLast7Days") : t("hqThisMonth")} · ${t("hqPerDay")} · ${t("hqTapPoint")}`}
      action={hasAny && (
        <button type="button" onClick={() => setAsTable((v) => !v)} aria-pressed={asTable} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold text-hq-primary hover:bg-hq-primary-soft">
          {asTable ? <LineIcon size={16} aria-hidden="true" /> : <Table2 size={16} aria-hidden="true" />}
          {asTable ? t("hqShowChart") : t("hqShowTable")}
        </button>
      )}
    >
      {!hasAny ? (
        <p className="py-12 text-center text-sm text-hq-muted">{t("hqNoBatchesInPeriod")}</p>
      ) : asTable ? (
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-hq-ink border-b border-hq-line">
                <th scope="col" className="text-start font-semibold py-2">{t("hqDay")}</th>
                <th scope="col" className="text-end font-semibold py-2">{t("hqGreenIn")} ({t("kgUnit")})</th>
                <th scope="col" className="text-end font-semibold py-2">{t("hqRoastedOut")} ({t("kgUnit")})</th>
              </tr>
            </thead>
            <tbody>
              {view.series.map((p) => (
                <tr key={p.date} className="border-b border-hq-line last:border-0">
                  <td className="py-2">{fmtShortDate(dayDate(p), lang)}{p.partial ? ` · ${t("hqWeekSoFar")}` : ""}</td>
                  <td className="py-2 text-end">{fmtNumber(p.greenKg, lang)}</td>
                  <td className="py-2 text-end">{fmtNumber(p.roastedKg, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="h-60" role="img" aria-label={t("hqTrendAria")}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                onClick={(e) => { const i = Number(e?.activeTooltipIndex); if (Number.isFinite(i)) onSelect(i); }}
              >
                <CartesianGrid stroke={HQ.line} vertical={false} />
                <XAxis dataKey="axis" reversed={dir === "rtl"} tick={{ fontSize: 12, fill: HQ.ink }} axisLine={{ stroke: HQ.control }} tickLine={false} interval="preserveStartEnd" />
                <YAxis orientation={dir === "rtl" ? "right" : "left"} domain={[0, "auto"]} tick={{ fontSize: 12, fill: HQ.muted }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  cursor={{ stroke: HQ.control }}
                  contentStyle={{ borderRadius: 8, border: `1px solid ${HQ.line}`, fontSize: 12, fontFamily: "inherit" }}
                  labelFormatter={(_, p) => { const d = p?.[0]?.payload as DayPoint | undefined; return d ? fmtShortDate(dayDate(d), lang) : ""; }}
                  formatter={(v) => [`${fmtNumber(Number(v), lang)} ${t("kgUnit")}`, t("hqRoastedOut")]}
                />
                <Area
                  type="linear"
                  dataKey="roastedKg"
                  stroke={HQ.primary}
                  strokeWidth={2}
                  fill={HQ.primarySoft}
                  fillOpacity={1}
                  isAnimationActive={false}
                  dot={{ r: 4, stroke: HQ.primary, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, stroke: HQ.primary, strokeWidth: 2, fill: HQ.primary }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {point && (
            <Strip>
              {fmtShortDate(dayDate(point), lang)}{point.partial ? ` (${t("hqWeekSoFar")})` : ""} · {fmtNumber(point.roastedKg, lang)} {t("kgUnit")} {t("hqRoastedOut")}
            </Strip>
          )}
          <p className="mt-2 text-xs text-hq-muted">{t("hqDayFootnote")}</p>
        </>
      )}
    </Card>
  );
}

// ─── Verdicts (donut) ───────────────────────────────────────────────────────

function Verdicts({ view, lang, t }: { view: PeriodView; lang: Lang; t: T }) {
  const pass = view.qcPassCount, reject = view.qcRejectCount, total = pass + reject;
  // The pass share is the API's rounded rate and the reject share its complement, so
  // the two printed shares always add to exactly 100.0.
  const passPct = view.qcPassRate ?? 0;
  const slices = [
    { name: t("hqAccepted"), value: pass, pct: passPct, color: HQ.chart1 },
    { name: t("hqRejected"), value: reject, pct: total > 0 ? 100 - passPct : 0, color: HQ.danger },
  ];
  return (
    <Card title={t("hqQcTitle")} meta={t("hqVerdictShare")}>
      {total === 0 ? (
        <p className="py-12 text-center text-sm text-hq-muted">{t("hqNoVerdictsInPeriod")}</p>
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
              <span className="text-xl font-bold text-hq-ink numeric">{fmtInt(total, lang)}</span>
              <span className="text-xs text-hq-muted">{t("hqVerdicts")}</span>
            </div>
          </div>
          <ul className="w-full space-y-2">
            {slices.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} aria-hidden="true" />
                <span className="text-hq-ink">{s.name}</span>
                <span className="ms-auto text-xs text-hq-muted numeric">{fmtInt(s.value, lang)} · {fmtNumber(s.pct, lang)}%</span>
              </li>
            ))}
          </ul>
          <p className="w-full text-xs text-hq-muted">{t("hqTotal")} {fmtInt(total, lang)} = {fmtInt(pass, lang)} + {fmtInt(reject, lang)} · {t("hqRoundingNote")}</p>
        </div>
      )}
    </Card>
  );
}

// ─── Green in, roasted out (paired bars) ────────────────────────────────────

function InOut({ view, sel, onSelect, lang, t, dir, className }: {
  view: PeriodView; sel: number | null; onSelect: (i: number) => void; lang: Lang; t: T; dir: "ltr" | "rtl"; className?: string;
}) {
  const data = view.series.map((p) => ({ ...p, axis: axisLabel(p) }));
  const hasAny = view.series.some((p) => p.greenKg > 0 || p.roastedKg > 0);
  const point = sel !== null ? view.series[sel] : null;
  return (
    <Card
      className={className}
      title={t("hqGreenVsRoasted")}
      meta={`${t("hqUnitKg")} · ${t("hqPerDay")}`}
      action={
        <div className="flex items-center gap-4 text-xs text-hq-ink">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: HQ.chart2 }} aria-hidden="true" />{t("hqGreenIn")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: HQ.chart1 }} aria-hidden="true" />{t("hqRoastedOut")}</span>
        </div>
      }
    >
      {!hasAny ? (
        <p className="py-12 text-center text-sm text-hq-muted">{t("hqNoBatchesInPeriod")}</p>
      ) : (
        <>
          <div className="h-48" role="img" aria-label={t("hqInOutAria")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                barGap={4}
                barCategoryGap="30%"
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                onClick={(e) => { const i = Number(e?.activeTooltipIndex); if (Number.isFinite(i)) onSelect(i); }}
              >
                <CartesianGrid stroke={HQ.line} vertical={false} />
                <XAxis dataKey="axis" reversed={dir === "rtl"} tick={{ fontSize: 12, fill: HQ.ink }} axisLine={{ stroke: HQ.control }} tickLine={false} interval="preserveStartEnd" />
                <YAxis orientation={dir === "rtl" ? "right" : "left"} domain={[0, "auto"]} tick={{ fontSize: 12, fill: HQ.muted }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  cursor={{ fill: HQ.neutral }}
                  contentStyle={{ borderRadius: 8, border: `1px solid ${HQ.line}`, fontSize: 12, fontFamily: "inherit" }}
                  labelFormatter={(_, p) => { const d = p?.[0]?.payload as DayPoint | undefined; return d ? fmtShortDate(dayDate(d), lang) : ""; }}
                  formatter={(v, name) => [`${fmtNumber(Number(v), lang)} ${t("kgUnit")}`, name]}
                />
                <Bar dataKey="greenKg" name={t("hqGreenIn")} fill={HQ.chart2} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="roastedKg" name={t("hqRoastedOut")} fill={HQ.chart1} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {point && (
            <Strip>
              {fmtShortDate(dayDate(point), lang)} · {t("hqGreenIn")} {fmtNumber(point.greenKg, lang)} · {t("hqRoastedOut")} {fmtNumber(point.roastedKg, lang)} {t("kgUnit")}
            </Strip>
          )}
        </>
      )}
    </Card>
  );
}

// ─── Quick reading of the period ────────────────────────────────────────────

function QuickRead({ view, period, lang, t }: { view: PeriodView; period: PeriodKey; lang: Lang; t: T }) {
  const days = view.series;
  const roastDays = days.filter((d) => d.roastedKg > 0);
  const best = roastDays.reduce<DayPoint | null>((b, d) => (!b || d.roastedKg > b.roastedKg ? d : b), null);
  const sumDays = days.reduce((s, d) => s + d.roastedKg, 0);
  return (
    <Card title={t("hqQuickRead")} meta={period === "week" ? t("hqLast7Days") : t("hqThisMonth")}>
      {roastDays.length === 0 ? (
        <p className="text-sm text-hq-muted">{t("hqNoBatchesInPeriod")}</p>
      ) : (
        <div className="space-y-4">
          {best && (
            <div>
              <p className="text-sm font-bold text-hq-primary">{t("hqBestDay")}: {fmtShortDate(dayDate(best), lang)}</p>
              <p className="text-sm text-hq-ink numeric">{fmtNumber(best.roastedKg, lang)} {t("kgUnit")} {t("hqRoastedOut")}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-hq-ink numeric">{fmtInt(roastDays.length, lang)} {t("hqOf")} {fmtInt(days.length, lang)} {t("hqDaysWithRoasting")}</p>
            <p className="text-xs text-hq-muted">{t("hqZeroDaysNote")}</p>
          </div>
          {fmtNumber(sumDays, lang) === fmtNumber(view.roastedKg, lang) && (
            <p className="text-xs text-hq-muted numeric">{t("hqDaysSumCheck")}: {fmtNumber(sumDays, lang)} {t("kgUnit")}</p>
          )}
        </div>
      )}
    </Card>
  );
}
