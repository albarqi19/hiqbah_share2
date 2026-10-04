import type { ReactNode } from "react";

export type MetricTone = "positive" | "negative" | "neutral";

const TONE: Record<MetricTone, string> = {
  positive: "text-hq-primary",
  negative: "text-hq-danger",
  neutral: "text-hq-muted",
};

/**
 * One figure with everything needed to read it: what it measures, over which
 * period, and against what.
 *
 * A null value means the figure could not be produced (no records in the period,
 * or the source failed). It renders as "—" with the reason — never as 0, which
 * would read as a real measurement.
 */
export function Metric({
  label,
  value,
  unit,
  definition,
  comparison,
  unavailable,
  loading = false,
  children,
}: {
  label: string;
  value: string | null;
  unit?: string;
  definition: string;
  comparison?: { text: string; tone?: MetricTone };
  /** Shown in place of the comparison when value is null. */
  unavailable?: string;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white border border-hq-line rounded-lg p-6 flex flex-col gap-2 min-w-0">
      <p className="text-sm leading-6 font-semibold text-hq-ink">{label}</p>
      {loading ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-9 w-32 rounded bg-hq-neutral animate-pulse" />
          <div className="h-3 w-full rounded bg-hq-neutral animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-hq-neutral animate-pulse" />
        </div>
      ) : (
        <>
          <p className="flex items-baseline gap-1 numeric">
            <span className="text-[30px] leading-10 font-semibold text-hq-ink">{value ?? "—"}</span>
            {value !== null && unit && <span className="text-xs text-hq-muted">{unit}</span>}
          </p>
          <p className="text-xs leading-5 text-hq-muted">{definition}</p>
          {value === null && unavailable ? (
            <p className="text-xs leading-5 text-hq-muted">{unavailable}</p>
          ) : (
            comparison && (
              <p className={`text-xs leading-5 ${TONE[comparison.tone ?? "neutral"]}`}>{comparison.text}</p>
            )
          )}
          {children}
        </>
      )}
    </div>
  );
}
