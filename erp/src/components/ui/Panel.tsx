import { useId, type ReactNode } from "react";

/**
 * A titled region of a screen — a chart, a list, a table. `meta` carries what the
 * content is measured in and where it comes from (unit, period, source, refresh
 * time), so a chart is never shown without its frame of reference.
 */
export function Panel({
  title,
  meta,
  actions,
  footer,
  flush = false,
  className = "",
  children,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  /** Let the content run to the panel edges (tables, lists with their own row padding). */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={`bg-white border border-hq-line rounded-lg flex flex-col min-w-0 ${className}`}>
      <div className={`flex items-start justify-between gap-3 flex-wrap ${flush ? "px-6 pt-5 pb-4" : "px-6 pt-5"}`}>
        <div className="min-w-0">
          <h2 id={id} className="text-base leading-[26px] font-bold text-hq-ink">{title}</h2>
          {meta && <p className="text-xs leading-5 text-hq-muted">{meta}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
      <div className={flush ? "" : "px-6 py-4"}>{children}</div>
      {footer && <div className="px-6 py-3 border-t border-hq-line text-xs leading-5 text-hq-muted">{footer}</div>}
    </section>
  );
}
