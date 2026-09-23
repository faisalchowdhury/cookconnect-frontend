"use client";

// Language support — Change Requirements section 02.
//   - French is the default on first load
//   - Moroccan Arabic (Darija), not Modern Standard Arabic, is the second locale
//   - dynamic content (job offers written in French) must also render in Darija,
//     which `pick()` handles by reading the `ar` field off the data object
//
// Deliberately dependency-free: locale lives in a context and in localStorage,
// with no URL segment, so no route restructuring is needed. Swapping this for
// next-intl later only touches this folder.

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { subscribe, getString, setValue } from "@/lib/browserStore";
import fr from "./dictionaries/fr.json";
import ar from "./dictionaries/ar.json";
import en from "./dictionaries/en.json";

const DICTIONARIES = { fr, ar, en };
const STORAGE_KEY = "nkhedmou.locale";
export const DEFAULT_LOCALE = "fr";

// French stays first and stays the default (Change Req 02); English is offered
// alongside it for international candidates and hotel groups.
export const LOCALES = [
  { id: "fr", label: "Français", short: "FR", dir: "ltr" },
  { id: "ar", label: "الدارجة", short: "AR", dir: "rtl" },
  { id: "en", label: "English", short: "EN", dir: "ltr" },
];

/**
 * Field-suffix per locale, for the `pick(obj, "title")` shape. French is the
 * unsuffixed base field, so it maps to an empty suffix.
 */
const LOCALE_SUFFIX = { fr: "", ar: "Ar", en: "En" };

/** BCP 47 tags for the `lang` attribute — "ar" alone would imply MSA, not Darija. */
const HTML_LANG = { fr: "fr", ar: "ar-MA", en: "en" };

const LocaleContext = createContext(null);

/** Walks "a.b.c" through the dictionary; returns undefined if any hop is missing. */
const lookup = (dict, key) =>
  key.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), dict);

export function LocaleProvider({ children }) {
  // The server always renders French; the client reads the stored preference and
  // React swaps to it after hydration without an extra effect-driven render.
  const locale = useSyncExternalStore(
    subscribe,
    () => {
      const stored = getString(STORAGE_KEY, DEFAULT_LOCALE);
      return DICTIONARIES[stored] ? stored : DEFAULT_LOCALE;
    },
    () => DEFAULT_LOCALE
  );

  const dir = LOCALES.find((l) => l.id === locale)?.dir ?? "ltr";

  // Syncing the document element is a genuine external-system effect.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale] ?? DEFAULT_LOCALE;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((next) => {
    if (!DICTIONARIES[next]) return;
    setValue(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key, vars) => {
      // Fall back to French, then to the key itself, so a missing Darija string
      // shows readable French rather than an empty slot.
      const raw = lookup(DICTIONARIES[locale], key) ?? lookup(DICTIONARIES.fr, key) ?? key;
      if (typeof raw !== "string" || !vars) return raw;
      return Object.entries(vars).reduce(
        (out, [k, v]) => out.replace(new RegExp(`{${k}}`, "g"), String(v)),
        raw
      );
    },
    [locale]
  );

  /**
   * Reads the active language off a data object that carries its own
   * translations. Two shapes are supported, both keyed by locale:
   *
   *   pick(sector)          -> { fr, ar, en }            whole-object labels
   *   pick(job, "title")    -> { title, titleAr, titleEn } one field of many
   *
   * French is the base key (`fr`, or the bare field name) because the site is
   * authored French-first; Arabic and English are suffixed. Anything missing
   * falls back to French rather than rendering blank, the same rule `t()` uses.
   *
   * This used to hardcode `locale === "ar" ? ... : obj.fr`, which meant an
   * English visitor got French for every sector, position, contract type and
   * city on the site — the interface chrome translated but nothing else did.
   */
  const pick = useCallback(
    (obj, field = "") => {
      if (!obj) return "";

      if (field) {
        const base = obj[field];
        if (locale === "fr") return base;
        return obj[`${field}${LOCALE_SUFFIX[locale]}`] || base;
      }

      if (locale === "fr") return obj.fr;
      return obj[locale] || obj.fr;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, pick, dir, isRTL: dir === "rtl" }),
    [locale, setLocale, t, pick, dir]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

/** Shorthand for the common case: `const t = useT()`. */
export function useT() {
  return useLocale().t;
}
