"use client";

// Shared chrome for every screen under (authLayout): brand mark, card, and a
// back-to-home link. Keeps the auth flow visually consistent now that the
// wording changed across all of them (Change Requirements section 01).
//
// The language switch is pinned to the top corner of every auth screen. These
// routes render without the navbar, so without it a candidate who does not read
// the default language has no way to change it before registering.

import Link from "next/link";
import Image from "next/image";
import logo from "../../../assets/CookconneKt 1.png";
import { useT } from "@/i18n/LocaleProvider";
import LanguageSwitch from "@/app/component/ui/LanguageSwitch";

export default function AuthShell({ title, subtitle, children, footer, wide = false }) {
  const t = useT();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10 font-poppins">
      {/* Positioned on a wrapper, not on LanguageSwitch: its root carries
          `relative` to anchor the dropdown, and Tailwind emits `.relative`
          after `.absolute`, so passing position classes in would be dropped. */}
      <div className="absolute end-4 top-4 sm:end-6 sm:top-6">
        <LanguageSwitch />
      </div>

      <Link href="/" className="mb-6 flex items-center gap-2">
        <Image src={logo} alt="" width={40} height={40} />
        <span className="text-xl font-bold text-gray-900">{t("brand.name")}</span>
      </Link>

      <div
        className={`w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8 ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        {title && <h1 className="text-center text-2xl font-bold text-gray-900">{title}</h1>}
        {subtitle && (
          <p className="mt-2 text-center text-sm leading-relaxed text-gray-600">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>}
    </div>
  );
}

/** "Continue with Google" — Change Requirements 05 (Google OAuth sign-in). */
export function GoogleButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    >
      <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.05 6.05 29.3 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.13-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.05 6.05 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C39.9 35.5 44 30.3 44 24c0-1.3-.13-2.4-.4-3.5z" />
      </svg>
      {label}
    </button>
  );
}

export function Divider({ label }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-xs uppercase tracking-wide text-gray-400">{label}</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
