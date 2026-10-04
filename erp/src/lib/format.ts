import type { Lang } from "@/lib/i18n/translations";

// Display formatting for the Hiqbah screens: Latin digits in both languages,
// Arabic units and words where the language is Arabic, and every clock time in
// Asia/Riyadh — the roastery's zone — whatever the viewing device is set to.
// Storage is unaffected; these only shape what is read.

export const DISPLAY_TIME_ZONE = "Asia/Riyadh";

function locale(lang: Lang): string {
  return lang === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB";
}

export function fmtNumber(n: number, lang: Lang, fractionDigits = 1): string {
  return new Intl.NumberFormat(locale(lang), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

export function fmtInt(n: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(d: Date | string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: DISPLAY_TIME_ZONE, day: "numeric", month: "long", year: "numeric",
  }).format(new Date(d));
}

export function fmtLongDate(d: Date | string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: DISPLAY_TIME_ZONE, weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(d));
}

export function fmtDateTime(d: Date | string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: DISPLAY_TIME_ZONE, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(d));
}

export function fmtTime(d: Date | string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: DISPLAY_TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(d));
}

/**
 * The gap between now and a deadline in whole hours (or minutes under an hour),
 * signed: positive is time left, negative is time overdue. Callers put the
 * absolute deadline beside it — a relative figure alone is not a deadline.
 */
export function hoursUntil(deadline: Date | string, now: Date = new Date()): { minutes: number; overdue: boolean } {
  const minutes = Math.round((new Date(deadline).getTime() - now.getTime()) / 60000);
  return { minutes, overdue: minutes < 0 };
}

export function fmtDuration(minutes: number, lang: Lang): string {
  const m = Math.abs(minutes);
  if (m < 60) return lang === "ar" ? `${m} دقيقة` : `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return lang === "ar" ? `${h} ساعة` : `${h} h`;
  const days = Math.floor(h / 24);
  return lang === "ar" ? `${days} يوم` : `${days} d`;
}

export function fmtMonthYear(d: Date | string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), { timeZone: DISPLAY_TIME_ZONE, month: "long", year: "numeric" }).format(new Date(d));
}

/** Day of the month in Asia/Riyadh, as a number. */
export function dayOfMonth(d: Date | string): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: DISPLAY_TIME_ZONE, day: "numeric" }).format(new Date(d)));
}

export function fmtShortDate(d: Date | string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), { timeZone: DISPLAY_TIME_ZONE, day: "numeric", month: "short" }).format(new Date(d));
}
