"use client";

// Main home banner. ClientDoc section 7: the admin can replace this background
// by uploading an image, or keep the plain background — so the image URL is
// data-driven rather than hardcoded in the markup.
//
// The old "Join CookConnekt" account-type modal that used to live here is gone:
// Change Requirements 03 replaced it with the split-screen hero directly below,
// and 03 also forbids duplicate call-to-action buttons.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { PHOTOS } from "@/mock/photos";
import { fetchSiteSettings, USE_API } from "@/mock/api";

/**
 * Admin-managed later; null keeps the plain tinted background.
 *
 * A cook working the line, to match "Trouvez votre place dans la restauration" —
 * the headline is about the job, so the picture is of the job rather than of a
 * finished plate.
 */
const BACKGROUND_IMAGE = PHOTOS.kitchenService;

/**
 * Banner height — the one value to change when it needs to be taller or shorter.
 *
 * `clamp(min, preferred, max)` is what makes it adjustable rather than fixed:
 * the middle term scales with the viewport width so the banner keeps its
 * proportions on every screen, while the floor stops it collapsing on a narrow
 * phone and the ceiling stops it filling a large monitor. Raise all three to
 * make the banner taller; they can be edited independently.
 */
const BANNER_HEIGHT = "clamp(420px, 50vw, 620px)";

export default function Banner() {
  const t = useT();
  const { isLoggedIn } = useSession();
  const [backgroundImage, setBackgroundImage] = useState(BACKGROUND_IMAGE);

  useEffect(() => {
    if (!USE_API) return undefined;
    let alive = true;
    fetchSiteSettings().then((settings) => {
      if (!alive) return;
      if (settings?.mode === "image" && settings.imageUrl) {
        setBackgroundImage({ src: settings.imageUrl, focus: "center" });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Contained to the same max-w-7xl column as the hero slider and the ad
  // banners below, so every banner on the page lines up at the same width.
  return (
    <section className="px-4 py-8 font-poppins">
      <div
        style={{ minHeight: BANNER_HEIGHT }}
        className="relative mx-auto flex max-w-7xl items-center justify-center overflow-hidden rounded-2xl bg-brand-tint px-4 py-16 sm:py-24"
      >
        {backgroundImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImage.src}
              alt=""
              style={{ objectPosition: backgroundImage.focus }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* A dark scrim rather than the old `bg-white/85` wash: the white
                overlay was strong enough to bleach the photograph out entirely.
                This keeps the image plainly visible while still giving the
                headline the contrast it needs, so the text turns white. */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" />
          </>
        )}

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            {t("home.heroSubtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/allJobs"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark sm:w-auto"
            >
              {t("nav.jobOffers")}
              <Search size={17} />
            </Link>

            {/* One CTA only — no duplicate Apply + Sign Up pairing (Change Req 03). */}
            {!isLoggedIn && (
              <Link
                href="/signUp"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark sm:w-auto"
              >
                {t("auth.createAccount")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
