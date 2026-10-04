import type { ReactNode } from "react";

/**
 * The top of a screen: what it is, what it covers, and its actions.
 *
 * `meta` is the context the figures on the page depend on — the period, the
 * scope, when the data was last refreshed — so it sits with the title rather than
 * somewhere a reader has to go looking for it.
 */
export function PageHeader({
  title,
  description,
  meta,
  actions,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-10 font-bold text-hq-ink">{title}</h1>
        {description && <p className="text-sm leading-6 text-hq-muted">{description}</p>}
        {meta && <p className="text-xs leading-5 text-hq-muted mt-0.5">{meta}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </header>
  );
}
