import type { ReactNode } from "react";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

export type AlertTone = "danger" | "warning" | "info";

const TONE: Record<AlertTone, { box: string; fg: string; Icon: React.ElementType }> = {
  danger: { box: "bg-hq-danger-soft border-hq-danger", fg: "text-hq-danger", Icon: AlertTriangle },
  warning: { box: "bg-hq-warning-soft border-hq-warning", fg: "text-hq-warning", Icon: Clock },
  info: { box: "bg-hq-primary-soft border-hq-primary", fg: "text-hq-primary", Icon: ShieldCheck },
};

/**
 * A problem that stays until it is resolved — data that failed to load, data that
 * is stale, a scope the reader should know about. It names the problem and the
 * next step; it is not a toast, and it does not disappear on its own.
 */
export function InlineAlert({
  tone,
  title,
  children,
  action,
}: {
  tone: AlertTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-3 border rounded-lg p-4 ${t.box}`}>
      <t.Icon size={20} className={`${t.fg} flex-shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-6 font-semibold ${t.fg}`}>{title}</p>
        {children && <div className="text-xs leading-5 text-hq-ink">{children}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
