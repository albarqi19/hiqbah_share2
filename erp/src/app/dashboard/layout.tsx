"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Factory, ClipboardCheck, Box,
  Truck, History, TrendingUp, Tag, Users, LogOut, Menu, X, ChevronRight,
  Settings, FlaskConical, Users2, ShoppingBag, Wallet, PackageCheck,
  ClipboardList, ShieldAlert, Home,
} from "lucide-react";
import { ROLE_LABELS, hasModuleAccess } from "@/lib/auth-shared";
import { LanguageProvider, useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { fmtLongDate } from "@/lib/format";
import { BrandMark } from "@/components/ui/BrandMark";
import { UserContext, useLogo, type User } from "./user-context";

const NAV_ITEMS: { key: TranslationKey; icon: React.ElementType; href: string; module?: string }[] = [
  // Home reads the same analytics feed as the dashboard, so it carries the same module.
  { key: "navHome",    icon: Home,            href: "/dashboard/today", module: "dashboard" },
  { key: "dashboard",  icon: LayoutDashboard, href: "/dashboard" },
  { key: "inventory",  icon: Package,         href: "/dashboard/inventory" },
  { key: "purchases",  icon: ShoppingBag,     href: "/dashboard/purchases", module: "inventory" },
  { key: "productsNav", icon: Package,        href: "/dashboard/products", module: "inventory" },
  { key: "orders",     icon: ShoppingCart,    href: "/dashboard/orders" },
  { key: "workstationPreparation", icon: PackageCheck, href: "/dashboard/workstation/preparation", module: "orders" },
  { key: "production", icon: Factory,         href: "/dashboard/production" },
  { key: "productionOrdersNav", icon: ClipboardList, href: "/dashboard/production-orders", module: "production" },
  { key: "qc",         icon: ClipboardCheck,  href: "/dashboard/qc" },
  { key: "packaging",  icon: Box,             href: "/dashboard/packaging" },
  { key: "dispatch",   icon: Truck,           href: "/dashboard/dispatch" },
  { key: "history",    icon: History,         href: "/dashboard/history" },
  { key: "analytics",  icon: TrendingUp,      href: "/dashboard/analytics" },
  { key: "labels",     icon: Tag,             href: "/dashboard/labels" },
  { key: "employees",  icon: Users,           href: "/dashboard/employees" },
  { key: "cupping",    icon: FlaskConical,    href: "/dashboard/cupping" },
  { key: "customers",  icon: Users2,          href: "/dashboard/customers" },
  { key: "accounting", icon: Wallet,          href: "/dashboard/accounting" },
  { key: "settings",   icon: Settings,        href: "/dashboard/settings" },
];

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

  return (
    <aside
      id="app-sidebar"
      className={`fixed lg:static top-0 h-[100dvh] z-[50] w-[240px] flex-shrink-0 bg-hq-neutral border-e border-hq-line text-hq-ink transform transition-transform duration-200 ease-out flex flex-col ltr:left-0 rtl:right-0 overflow-y-auto ${
        sidebarOpen ? "translate-x-0" : "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full"
      }`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Workspace */}
      <div className="flex items-center justify-between gap-2 px-4 h-16 border-b border-hq-line flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BrandMark logo={logoBase64} />
          <div className="min-w-0">
            <p className="text-sm leading-6 font-semibold tracking-wide">HIQBAH</p>
            <p className="text-xs leading-5 truncate">مقهى و محمصة حقبة</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label={t("closeMenu")}
          className="lg:hidden w-9 h-9 rounded-md flex items-center justify-center hover:bg-hq-neutral-strong"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Signed-in user — opens the profile */}
      <div className="px-4 py-3 border-b border-hq-line">
        <button
          type="button"
          onClick={() => { router.push("/dashboard/profile"); setSidebarOpen(false); }}
          className="flex items-center gap-2 w-full text-start rounded-md p-1 -m-1 hover:bg-hq-neutral-strong transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-hq-primary-soft flex items-center justify-center flex-shrink-0">
            <span className="text-hq-primary text-sm font-semibold">{user.name.charAt(0)}</span>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm leading-6 font-semibold truncate">{user.name}</span>
            <span className="block text-xs leading-5 truncate">{ROLE_LABELS[user.role] || user.role}</span>
          </span>
        </button>
      </div>

      {/* Navigation. One <nav>, each module once, link name = the module name. */}
      <nav aria-label={t("mainNavigation")} className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
        {filteredNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <a
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 h-10 rounded-md text-sm font-semibold transition-colors duration-150 ${
                active ? "bg-hq-primary text-white" : "text-hq-ink hover:bg-hq-neutral-strong"
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" className="flex-shrink-0" />
              <span className="flex-1 truncate">{t(item.key)}</span>
              {active && <ChevronRight size={16} aria-hidden="true" className="opacity-80 rtl:rotate-180 flex-shrink-0" />}
            </a>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-4 py-3 border-t border-hq-line">
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-3 h-10 rounded-md w-full text-sm font-semibold text-hq-ink hover:bg-hq-danger-soft hover:text-hq-danger transition-colors duration-150"
        >
          <LogOut size={20} strokeWidth={1.75} aria-hidden="true" />
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
  const { lang, t } = useI18n();
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
        <header className="h-16 bg-white border-b border-hq-line px-5 lg:px-8 flex items-center gap-4 z-30 flex-shrink-0">
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
          <p className="text-xs leading-5 text-hq-muted hidden sm:block">
            {fmtLongDate(new Date(), lang)}
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
