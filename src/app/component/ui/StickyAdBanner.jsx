"use client";

// The follow-along banner from Change Requirements section 04:
//
//   "Add a banner that follows the user as they browse the platform
//    (fixed/sticky placement — not blocking content). Shown on all pages
//    during a session."
//
// Two details that matter: it must not block content (so it is a slim bar the
// user can dismiss, and the layout reserves space for it), and dismissal lasts
// for the session only — sessionStorage, not localStorage.

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { subscribe, getString, setValue } from "@/lib/browserStore";
import { STICKY_BANNER } from "@/mock/banners";
import { fetchBanners, USE_API } from "@/mock/api";

const DISMISS_KEY = "nkhedmou.stickyAd.dismissed";

export default function StickyAdBanner() {
  const { isLoggedIn } = useSession();
  const { pick } = useLocale();
  const [banner, setBanner] = useState(STICKY_BANNER);

  useEffect(() => {
    if (!USE_API) return undefined;
    let alive = true;
    fetchBanners("sticky").then((rows) => {
      if (!alive) return;
      if (rows?.[0]) setBanner(rows[0]);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Dismissal lasts for the session only, so this reads sessionStorage rather
  // than localStorage. The server snapshot is "not dismissed", which is the
  // common case and what the prerendered HTML should show.
  const visible = useSyncExternalStore(
    subscribe,
    () => getString(DISMISS_KEY, "", "session") !== "1",
    () => true
  );

  const dismiss = () => setValue(DISMISS_KEY, "1", "session");

  if (!visible) return null;

  return (
    <>
      {/* Spacer so the fixed bar never covers the footer or page content. */}
      <div aria-hidden className="h-16 sm:h-14" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-dark/30 bg-brand text-white shadow-[0_-2px_12px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{pick(banner, "title")}</p>
            <p className="truncate text-xs text-white/80">{pick(banner, "subtitle")}</p>
          </div>

          {!isLoggedIn && (
            <Link
              href={banner.href}
              className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-tint sm:px-4 sm:text-sm"
            >
              {pick(banner, "cta")}
            </Link>
          )}

          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="shrink-0 rounded p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
