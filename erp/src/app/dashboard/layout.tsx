"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { ROLE_LABELS, hasModuleAccess } from "@/lib/auth-shared";
import { LanguageProvider, useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { UserContext, useLogo, type User } from "./user-context";

type NavGroup = "workspace" | "admin";

// Grouped as in the Hiqbah operations design: day-to-day work first, then finance and
// administration. Text only — the label is the link's whole accessible name.
const NAV_ITEMS: { key: TranslationKey; href: string; module?: string; group: NavGroup }[] = [
  // Home reads the same analytics feed as the dashboard, so it carries the same module.
  { key: "navHome",    href: "/dashboard/today", module: "dashboard", group: "workspace" },
  { key: "dashboard",  href: "/dashboard", group: "workspace" },
  { key: "orders",     href: "/dashboard/orders", group: "workspace" },
  { key: "workstationPreparation", href: "/dashboard/workstation/preparation", module: "orders", group: "workspace" },
  { key: "customers",  href: "/dashboard/customers", group: "workspace" },
  { key: "productsNav", href: "/dashboard/products", module: "inventory", group: "workspace" },
  { key: "inventory",  href: "/dashboard/inventory", group: "workspace" },
  { key: "purchases",  href: "/dashboard/purchases", module: "inventory", group: "workspace" },
  { key: "production", href: "/dashboard/production", group: "workspace" },
  { key: "productionOrdersNav", href: "/dashboard/production-orders", module: "production", group: "workspace" },
  { key: "qc",         href: "/dashboard/qc", group: "workspace" },
  { key: "packaging",  href: "/dashboard/packaging", group: "workspace" },
  { key: "dispatch",   href: "/dashboard/dispatch", group: "workspace" },
  { key: "cupping",    href: "/dashboard/cupping", group: "workspace" },
  { key: "labels",     href: "/dashboard/labels", group: "workspace" },
  { key: "accounting", href: "/dashboard/accounting", group: "admin" },
  { key: "analytics",  href: "/dashboard/analytics", group: "admin" },
  { key: "history",    href: "/dashboard/history", group: "admin" },
  { key: "employees",  href: "/dashboard/employees", group: "admin" },
  { key: "settings",   href: "/dashboard/settings", group: "admin" },
];

const GROUP_LABEL: Record<NavGroup, TranslationKey> = { workspace: "navGroupWorkspace", admin: "navGroupAdmin" };

function isActive(pathname: string, href: string) {
  // Compared on whole path segments, not raw prefixes: a bare startsWith makes
  // "/dashboard/production" light up on "/dashboard/production-orders" too, so two
  // entries would look selected at once.
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
}

function SidebarNav({
  user,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}: {
  user: User;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const router = useRouter();
  const logoBase64 = useLogo();

  const filteredNav = NAV_ITEMS.filter((item) => {
    // Settings is strictly admin-only — double-guard beyond permissions
    if (item.key === "settings" && user.role !== "admin") return false;
    // `module` lets a nav item piggyback on a different permission key (e.g. purchases → inventory)
    return hasModuleAccess(user.permissions, item.module ?? (item.key as string));
  });

  const groups = (["workspace", "admin"] as const)
    .map((g) => ({ g, items: filteredNav.filter((i) => i.group === g) }))
    .filter((x) => x.items.length > 0);

  return (
    <aside
      id="app-sidebar"
      className={`fixed lg:static top-0 h-[100dvh] z-[50] w-[240px] flex-shrink-0 bg-white border-e border-hq-line text-hq-ink transform transition-transform duration-200 ease-out flex flex-col ltr:left-0 rtl:right-0 overflow-y-auto ${
        sidebarOpen ? "translate-x-0" : "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full"
      }`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Wordmark — the uploaded logo when there is one */}
      <div className="flex items-start justify-between gap-2 px-6 pt-6 pb-4 flex-shrink-0">
        <div className="min-w-0">
          {logoBase64 ? (
            <img src={logoBase64} alt="حقبة" className="h-10 w-auto object-contain" />
          ) : (
            <p className="text-[26px] leading-10 font-bold text-hq-primary">حقبة</p>
          )}
          <p dir="ltr" className="text-[11px] leading-4 tracking-wide text-hq-muted text-end">COFFEE ROASTERS / ERP</p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label={t("closeMenu")}
          className="lg:hidden w-9 h-9 rounded-md flex items-center justify-center hover:bg-hq-bg"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Navigation. One <nav>, each module once, link name = the module name. */}
      <nav aria-label={t("mainNavigation")} className="flex-1 overflow-y-auto px-4 pb-4">
        {groups.map(({ g, items }) => (
          <div key={g} className="pt-4 first:pt-2">
            <p className="px-3 pb-2 text-xs leading-5 text-hq-muted">{t(GROUP_LABEL[g])}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-3 h-10 rounded-md text-sm transition-colors duration-150 ${
                        active ? "bg-hq-primary-soft text-hq-ink font-bold" : "text-hq-ink hover:bg-hq-bg"
                      }`}
                    >
                      {t(item.key)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Signed-in user and sign out */}
      <div className="px-4 py-4 border-t border-hq-line space-y-1">
        <button
          type="button"
          onClick={() => { router.push("/dashboard/profile"); setSidebarOpen(false); }}
          className="flex items-center gap-3 w-full text-start rounded-md px-2 py-2 hover:bg-hq-bg transition-colors"
        >
          <span className="w-9 h-9 rounded-md bg-hq-primary-soft flex items-center justify-center flex-shrink-0">
            <span className="text-hq-primary text-sm font-bold">{user.name.charAt(0)}</span>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm leading-6 font-semibold truncate">{user.name}</span>
            <span className="block text-xs leading-5 text-hq-muted truncate">{ROLE_LABELS[user.role] || user.role}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-3 h-9 rounded-md w-full text-sm text-hq-ink hover:bg-hq-danger-soft hover:text-hq-danger transition-colors duration-150"
        >
          <LogOut size={16} aria-hidden="true" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}

/**
 * The module a dashboard route belongs to, by longest matching navigation prefix.
 *
 * Longest-match so a nested route resolves to its own section rather than a shorter one
 * that happens to share a prefix, and so detail pages (a production order, say) inherit
 * the same requirement as their list.
 */
function requiredModuleFor(pathname: string): string | null {
  const match = NAV_ITEMS.filter(
    (item) => item.href !== "/dashboard" && (pathname === item.href || pathname.startsWith(item.href + "/"))
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return match ? match.module ?? (match.key as string) : null;
}

function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  // Hiding a navigation entry keeps a screen out of the way; it does not keep anybody out
  // of it. Typing the address, following an old bookmark or using browser history all
  // reached the page, which then rendered its full chrome and an empty list — because the
  // APIs behind it were refusing every request. The data was never exposed and no write
  // was ever accepted, but the operator was shown a working-looking screen for work they
  // cannot do. The route is refused here, once, for every dashboard page.
  const requiredModule = requiredModuleFor(pathname);
  const routeAllowed =
    requiredModule === null ||
    (hasModuleAccess(user.permissions, requiredModule) &&
      // Settings carries the same admin-only double guard as its navigation entry.
      (requiredModule !== "settings" || user.role === "admin"));

  const section = NAV_ITEMS.filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="h-screen overflow-hidden flex bg-hq-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-hq-primary-soft focus:text-hq-primary focus:text-sm focus:font-semibold focus:border-2 focus:border-hq-primary"
      >
        {t("skipToContent")}
      </a>

      {sidebarOpen && (
        <div
          className="fixed inset-x-0 top-0 h-[100dvh] bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SidebarNav
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-hq-bg px-5 lg:px-8 flex items-center gap-4 z-30 flex-shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("openMenu")}
            aria-controls="app-sidebar"
            aria-expanded={sidebarOpen}
            className="lg:hidden w-9 h-9 -ms-2 rounded-md flex items-center justify-center text-hq-ink hover:bg-hq-neutral relative z-[60]"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <p className="flex-1 min-w-0 text-base leading-[26px] font-bold text-hq-ink truncate">
            {section ? t(section.key) : ""}
          </p>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-5 lg:p-8 focus:outline-none">
          {routeAllowed ? (
            children
          ) : (
            <div className="max-w-md mx-auto mt-16 bg-white rounded-lg border border-hq-line p-8 text-center">
              <div className="w-12 h-12 rounded-lg bg-hq-danger-soft flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={22} className="text-hq-danger" aria-hidden="true" />
              </div>
              <h1 className="text-base leading-[26px] font-bold text-hq-ink">{t("accessDeniedTitle")}</h1>
              <p className="text-sm leading-6 text-hq-muted mt-1.5">{t("accessDeniedBody")}</p>
              <a
                href="/dashboard"
                className="inline-flex items-center h-9 mt-5 px-4 bg-hq-primary text-white rounded-md text-sm font-semibold hover:bg-hq-primary-strong transition-colors"
              >
                {t("dashboard")}
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/settings/logo").then((r) => r.json()).catch(() => ({ logoBase64: null })),
    ])
      .then(([meData, logoData]) => {
        setUser(meData.user);
        setLogoBase64(logoData.logoBase64 ?? null);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    // The language is not known until /me answers, so this one line is bilingual.
    return (
      <div className="min-h-screen flex items-center justify-center bg-hq-bg" role="status">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-hq-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-hq-ink font-semibold">جارٍ التحميل… · Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <UserContext value={{ user, logoBase64 }}>
      <LanguageProvider lang={user.preferredLanguage ?? "ar"}>
        <DashboardShell user={user}>{children}</DashboardShell>
      </LanguageProvider>
    </UserContext>
  );
}
