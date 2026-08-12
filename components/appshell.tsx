"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "./icons";
import { Logo } from "./logo";
import { useAuth } from "./auth";
import { useDB } from "@/lib/store";
import { fmtBytes } from "@/lib/format";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/library", label: "Library", icon: "library" },
  { href: "/highlights", label: "Highlights", icon: "highlight" },
  { href: "/places", label: "Places", icon: "places" },
  { href: "/inspiration", label: "Inspiration", icon: "inspiration" },
  { href: "/projects", label: "Projects", icon: "projects" },
  { href: "/about", label: "About", icon: "about" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const db = useDB();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const totalBytes = db.memories.reduce((n, m) => n + m.file_size, 0);
  const max = 50 * 1024 * 1024 * 1024;
  const pct = Math.min(100, (totalBytes / max) * 100);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const itemCls = (href: string) =>
    `relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 overflow-hidden ${
      collapsed ? "justify-center px-0" : ""
    } ${
      isActive(href)
        ? "text-white bg-gradient-to-r from-brand-purple to-brand-blue shadow-lg shadow-brand-purple/30"
        : "text-slate-600 hover:text-ink hover:bg-white/60"
    }`;

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          onClick={() => setMobileOpen(false)}
          className={itemCls(n.href)}
          title={collapsed ? n.label : undefined}
        >
          <Icon name={n.icon} className="w-5 h-5 shrink-0" />
          {!collapsed && n.label}
          {isActive(n.href) && !collapsed && (
            <span className="absolute inset-0 rounded-2xl bg-white/15 shimmer-slide" aria-hidden="true" />
          )}
        </Link>
      ))}
      <Link
        href="/settings"
        onClick={() => setMobileOpen(false)}
        className={itemCls("/settings")}
        title={collapsed ? "Settings" : undefined}
      >
        <Icon name="settings" className="w-5 h-5 shrink-0" />
        {!collapsed && "Settings"}
      </Link>
    </nav>
  );

  const sidebarBody = (
    <div className="flex flex-col flex-1 min-h-0">
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-2 py-2 mb-6`}>
        {!collapsed && (
          <>
            <Logo />
            <div>
              <div className="font-display font-bold text-lg leading-none">PocketFrame</div>
              <div className="text-[11px] text-slate-600">Your visual journal</div>
            </div>
          </>
        )}
        {collapsed && <Logo className="w-9 h-9" />}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:grid place-items-center w-7 h-7 rounded-full text-slate-600 hover:text-ink hover:bg-white/60 transition-colors ml-2"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={collapsed ? "chevronR" : "chevronL"} className="w-4 h-4" />
        </button>
      </div>
      {nav}
      <div className="mt-auto pt-6">
        {!collapsed ? (
          <div className="bg-white/60 rounded-2xl p-3 border border-white/40">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-600">Storage</span>
              <span className="font-medium text-slate-700">{fmtBytes(totalBytes)}</span>
            </div>
            <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan transition-all"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-xl bg-white/60 border border-white/40 grid place-items-center text-slate-600" title="Storage">
            <Icon name="layers" className="w-4 h-4" />
          </div>
        )}
        <div className={`flex items-center gap-2 mt-3 ${collapsed ? "justify-center" : "px-2"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-pink to-brand-orange grid place-items-center text-white text-xs font-bold shrink-0">
            {db.profile.name[0]?.toUpperCase() || "R"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{db.profile.name}</div>
                <div className="text-xs text-slate-600 truncate">{db.profile.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="p-2 rounded-lg text-slate-600 hover:text-brand-pink hover:bg-white/60 transition-colors"
                title="Sign out"
              >
                <Icon name="logout" className="w-4 h-4" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="p-2 rounded-lg text-slate-600 hover:text-brand-pink transition-colors"
              title="Sign out"
            >
              <Icon name="logout" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside
        className={`hidden lg:flex flex-col ${collapsed ? "w-[86px]" : "w-64"} shrink-0 border-r border-white/40 bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-2xl p-4 sticky top-0 h-screen transition-all duration-300 relative overflow-hidden`}
      >
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-brand-purple/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-brand-cyan/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-40 h-40 rounded-full bg-brand-pink/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col flex-1 min-h-0">{sidebarBody}</div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-black/5 flex justify-around py-2 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {NAV.slice(0, 5).map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium ${
              isActive(n.href) ? "text-brand-purple" : "text-slate-600"
            }`}
          >
            <Icon name={n.icon} className="w-5 h-5" />
            {n.label}
          </Link>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-black/5 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-black/5"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <span className="font-display font-bold">PocketFrame</span>
          </Link>
          <div className="flex-1 max-w-xl">
            <label className="flex items-center gap-2 bg-black/[0.04] rounded-full px-4 py-2 focus-within:ring-2 ring-brand-purple/40 transition">
              <Icon name="search" className="w-4 h-4 text-slate-600" />
              <input
                className="bg-transparent text-sm w-full outline-none placeholder:text-slate-600"
                placeholder="Search memories, places, tags…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    router.push(`/library?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
              />
            </label>
          </div>
          <Link
            href="/upload"
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-medium shadow-lg shadow-brand-purple/30 hover:shadow-brand-purple/50 hover:-translate-y-px transition-all"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span className="hidden sm:inline">Add memory</span>
          </Link>
          <Link
            href="/settings"
            className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-brand-pink to-brand-orange grid place-items-center text-white text-xs font-bold"
          >
            {db.profile.name[0]?.toUpperCase() || "R"}
          </Link>
        </header>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[57px] z-30 glass border-b border-black/5 p-4 shadow-xl fadein">
            {nav}
          </div>
        )}

        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
