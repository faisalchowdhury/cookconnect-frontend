"use client";

// Language switch — Change Requirements 02: it must be clear and easy to find,
// so it stays visible on mobile rather than being buried in a burger menu.
//
// Lives in ui/ rather than shared/Navbar because the auth screens need it too:
// a candidate who cannot read the interface cannot register, and the auth flow
// renders without a navbar. Owns its own open/close state so every mount is
// independent — Navbar renders one for desktop and one for mobile.

import { Globe, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { useLocale, useT, LOCALES } from "@/i18n/LocaleProvider";

/**
 * The root is `relative` so the dropdown can anchor to it. Position this from a
 * wrapper rather than by passing position utilities in — Tailwind emits
 * `.relative` after `.absolute`, so an `absolute` passed here loses silently.
 */
export default function LanguageSwitch({ compact = false }) {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  const active = LOCALES.find((l) => l.id === locale);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.language")}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 transition hover:bg-gray-50 ${
          compact ? "px-2.5 py-2" : "px-3.5 py-2"
        }`}
      >
        <Globe size={16} />
        <span className="font-medium">{active?.short}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {LOCALES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLocale(l.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-start text-sm transition hover:bg-gray-50 ${
                  l.id === locale ? "font-semibold text-brand" : "text-gray-700"
                }`}
              >
                {l.label}
                {l.id === locale && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
