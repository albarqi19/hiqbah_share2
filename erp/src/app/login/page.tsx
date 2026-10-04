"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Delete, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { PIN_LENGTH } from "@/lib/pin-policy";
import { BrandMark } from "@/components/ui/BrandMark";
import { InlineAlert } from "@/components/ui/InlineAlert";

type Mode = "pin" | "password";

// The pad is now fixed-length, which is what lets it submit on the last digit without
// guessing whether the operator has finished. Both constants come from the single PIN
// rule the server enforces, so a pad that fills up is a pad holding a PIN the server
// will accept the shape of — the screen can no longer offer a length the API refuses.
const PIN_AUTO_SUBMIT_LENGTH = PIN_LENGTH;
const PIN_MAX_LENGTH = PIN_LENGTH;

// Nobody is signed in yet, so there is no language preference to read. The screen is
// Arabic-first, with the English name of the PIN step kept beside it for staff who
// work in English.
export default function LoginPage() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("pin");
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ── Core submit ──────────────────────────────────────────────────────────────
  async function safeJson(res: Response) {
    try { return await res.json(); } catch { return null; }
  }

  const submitPin = useCallback(async (pinValue: string) => {
    if (!pinValue || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "pin", pin: pinValue }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? "Login failed");
      router.push(data?.redirectTo ?? "/dashboard");
    } catch (err: unknown) {
      setPin("");
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  const submitPassword = useCallback(async () => {
    if (!username.trim() || !password || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "password", username: username.trim(), password }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? "Login failed");
      router.push(data?.redirectTo ?? "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }, [username, password, loading, router]);

  // ── Fetch logo ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/settings/logo")
      .then((r) => r.json())
      .then((d) => setLogoBase64(d.logoBase64 ?? null))
      .catch(() => {});
  }, []);

  // ── Auto-submit when PIN hits the magic length ────────────────────────────
  useEffect(() => {
    if (mode !== "pin" || pin.length !== PIN_AUTO_SUBMIT_LENGTH) return;
    // Small delay so the last dot renders visibly before the network call fires
    const t = setTimeout(() => submitPin(pin), 300);
    return () => clearTimeout(t);
  }, [pin, mode, submitPin]);

  // ── Numpad handlers ──────────────────────────────────────────────────────────
  function pressKey(key: string) {
    if (loading) return;
    if (key === "backspace") {
      setPin((p) => p.slice(0, -1));
      setError("");
    } else if (pin.length < PIN_MAX_LENGTH) {
      setPin((p) => p + key);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setPin("");
    setPassword("");
    setError("");
  }

  const numpadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["backspace", "0", "submit"],
  ];

  const keyBase =
    "h-14 rounded-lg flex items-center justify-center select-none transition-colors duration-150 disabled:cursor-not-allowed";

  return (
    <div dir="rtl" lang="ar" className="min-h-screen flex flex-col items-center justify-center gap-4 bg-hq-bg p-4">
      <main className="w-full max-w-[420px] bg-white border border-hq-line rounded-2xl p-6 sm:p-8 space-y-6">

        {/* Workspace */}
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandMark logo={logoBase64} size="md" />
          <h1 className="text-base leading-[26px] font-bold text-hq-ink">مقهى و محمصة حقبة</h1>
          <p dir="ltr" className="text-xs leading-5 tracking-[2px] text-hq-muted">HIQBAH COFFEE ROASTERS</p>
        </div>

        {/* Sign-in method */}
        <div role="group" aria-label="طريقة الدخول" className="flex gap-1 p-1 bg-hq-neutral rounded-lg">
          {([
            ["pin", "دخول سريع بـ PIN"],
            ["password", "اسم المستخدم"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => mode !== value && switchMode(value)}
              className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors duration-150 ${
                mode === value ? "bg-white border border-hq-line text-hq-ink" : "text-hq-ink hover:bg-hq-neutral-strong"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "pin" ? (
          <>
            <div className="space-y-3">
              <div>
                <p className="text-sm leading-6 font-semibold text-hq-ink">
                  أدخل رقمك السري <span className="font-normal text-hq-muted">·</span> <span lang="en" dir="ltr" className="font-normal text-hq-muted">Enter Your PIN</span>
                </p>
                <p className="text-xs leading-5 text-hq-muted">{PIN_LENGTH} أرقام · يُرسل تلقائيًا عند الرقم الأخير</p>
              </div>

              {/* PIN progress. Digits are never shown, only how many have been entered. */}
              <div
                role="status"
                aria-live="polite"
                aria-label={`أُدخل ${pin.length} من ${PIN_LENGTH}`}
                className="h-[68px] flex items-center justify-center gap-4 bg-hq-neutral border border-hq-control rounded-lg"
              >
                {pin.length === 0 ? (
                  <span className="text-sm text-hq-muted select-none">اضغط على لوحة الأرقام للبدء</span>
                ) : (
                  <span dir="ltr" className="flex items-center gap-4" aria-hidden="true">
                    {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full transition-colors duration-150 ${
                          i < pin.length - 1
                            ? "bg-hq-ink"
                            : i === pin.length - 1
                              ? "bg-hq-primary ring-2 ring-hq-primary-soft ring-offset-1"
                              : "border-[1.5px] border-hq-control"
                        }`}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <InlineAlert tone="danger" title="تعذّر تسجيل الدخول">
                <span lang="en" dir="auto">{error}</span>
              </InlineAlert>
            )}

            {/* Numpad — left-to-right like every keypad; a digit is not mirrored in Arabic. */}
            <div dir="ltr" className="grid grid-cols-3 gap-3">
              {numpadRows.flat().map((key) => {
                if (key === "backspace") {
                  return (
                    <button
                      key="backspace"
                      type="button"
                      aria-label="حذف آخر رقم"
                      onClick={() => pressKey("backspace")}
                      disabled={pin.length === 0 || loading}
                      className={`${keyBase} text-hq-ink hover:bg-hq-neutral disabled:opacity-30`}
                    >
                      <Delete size={24} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  );
                }
                if (key === "submit") {
                  return (
                    <button
                      key="submit"
                      type="button"
                      aria-label="تسجيل الدخول"
                      onClick={() => submitPin(pin)}
                      disabled={pin.length < PIN_LENGTH || loading}
                      className={`${keyBase} bg-hq-primary text-white hover:bg-hq-primary-strong ${loading ? "" : "disabled:opacity-35"}`}
                    >
                      {loading
                        ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        : <ArrowLeft size={24} strokeWidth={2} aria-hidden="true" />
                      }
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pressKey(key)}
                    disabled={loading}
                    className={`${keyBase} bg-white border border-hq-line text-hq-ink text-[30px] leading-10 font-semibold hover:bg-hq-bg active:bg-hq-neutral disabled:opacity-35`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); submitPassword(); }}
            noValidate
          >
            <div className="space-y-2">
              <label htmlFor="login-username" className="flex items-baseline gap-2 text-sm leading-6 font-semibold text-hq-ink">
                اسم المستخدم <span className="text-xs font-normal text-hq-muted">مطلوب</span>
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: ahmed"
                autoCapitalize="none"
                autoComplete="username"
                required
                aria-describedby="login-username-help"
                className="w-full h-11 px-3 bg-white border border-hq-control rounded-md text-sm text-hq-ink placeholder:text-hq-muted focus:outline-none focus:ring-2 focus:ring-hq-primary focus:border-hq-primary"
              />
              <p id="login-username-help" className="text-xs leading-5 text-hq-muted">اسم المستخدم كما هو مسجّل في النظام.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="flex items-baseline gap-2 text-sm leading-6 font-semibold text-hq-ink">
                كلمة المرور <span className="text-xs font-normal text-hq-muted">مطلوب</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  className={`w-full h-11 ps-3 pe-11 bg-white border rounded-md text-sm text-hq-ink focus:outline-none focus:ring-2 focus:ring-hq-primary focus:border-hq-primary ${
                    error ? "border-hq-danger border-[1.5px]" : "border-hq-control"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute end-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center text-hq-muted hover:text-hq-ink"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {error && (
                <p id="login-error" role="alert" className="text-xs leading-5 text-hq-danger">
                  <span lang="en" dir="auto">{error}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-hq-primary hover:bg-hq-primary-strong text-white text-sm font-semibold rounded-md transition-colors duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" /> جارٍ التحقق…</>
                : "تسجيل الدخول"
              }
            </button>
          </form>
        )}

        <p className="text-xs leading-5 text-hq-muted text-center">
          نسيت رقمك أو كلمة المرور؟ تواصل مع مسؤول النظام لإعادة تعيينها.
        </p>
      </main>
    </div>
  );
}
