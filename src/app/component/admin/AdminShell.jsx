"use client";

// Admin chrome: sidebar navigation, language switch and a link back to the
// public site. Kept separate from the public Navbar/Footer so the admin area
// has its own layout, as in the Figma admin screens.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, Briefcase, ImageIcon,
  MessageSquare, ScrollText, ShieldCheck, ArrowLeft, Menu, X, Globe,
} from "lucide-react";

import { useLocale, useT, LOCALES } from "@/i18n/LocaleProvider";

const NAV = [
  { href: "/admin", labelKey: "admin.overview", icon: LayoutDashboard },
  { href: "/admin/candidates", labelKey: "admin.candidates", icon: Users },
  { href: "/admin/employers", labelKey: "admin.employers", icon: Building2 },
  { href: "/admin/offers", labelKey: "admin.offers", icon: Briefcase },
  { href: "/admin/moderation", labelKey: "admin.moderation", icon: ImageIcon },
  { href: "/admin/feedback", labelKey: "admin.feedback", icon: MessageSquare },
  { href: "/admin/activity", labelKey: "admin.activity", icon: ScrollText },
  { href: "/admin/roles", labelKey: "admin.roles", icon: ShieldCheck },
];

export default function AdminShell({ children }) {
  const t = useT();
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 w-64 shrink-0 border-e border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              N
            </span>
            <span className="text-sm font-bold text-gray-900">{t("admin.title")}</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3">
          <ul className="space-y-1">
            {NAV.map(({ href, labelKey, icon: Icon }) => {
              // /admin must match exactly, or it stays highlighted on every child route.
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-brand-soft font-semibold text-brand-dark"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={17} />
                    {t(labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft size={17} className="rtl:rotate-180" />
              {t("admin.backToSite")}
            </Link>
          </div>
        </nav>
      </aside>

      {open && (
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            aria-label={t("nav.menu")}
          >
            <Menu size={20} />
          </button>

          <div className="ms-auto flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-0.5">
              <Globe size={14} className="ms-2 text-gray-400" />
              {LOCALES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLocale(l.id)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                    l.id === locale ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {l.short}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-s border-gray-200 ps-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                A
              </span>
              <span className="hidden text-sm sm:block">
                <span className="block font-medium text-gray-900">Admin principal</span>
                <span className="block text-xs text-gray-500">admin@nkhedmou.ma</span>
              </span>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
