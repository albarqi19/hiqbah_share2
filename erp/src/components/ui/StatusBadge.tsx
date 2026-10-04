import type { ReactNode } from "react";

export type BadgeTone = "positive" | "warning" | "danger" | "neutral" | "info";

const TONE: Record<BadgeTone, { box: string; dot: string }> = {
  positive: { box: "bg-hq-primary-soft text-hq-primary", dot: "bg-hq-primary" },
  warning: { box: "bg-hq-warning-soft text-hq-warning", dot: "bg-hq-warning" },
  danger: { box: "bg-hq-danger-soft text-hq-danger", dot: "bg-hq-danger" },
  neutral: { box: "bg-hq-neutral text-hq-ink", dot: "bg-hq-muted" },
  info: { box: "bg-hq-info-soft text-hq-info", dot: "bg-hq-info" },
};

/** A status in words. The colour and dot help scanning; the text carries the meaning. */
export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const t = TONE[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs leading-5 whitespace-nowrap ${t.box}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {children}
    </span>
  );
}
