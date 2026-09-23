"use client";

// Split-screen hero — Change Requirements section 03 ("I'm Looking for a Job" /
// "I'm an Employer").
//
// Two panels side by side, not a rotating slider: the client wants both routes
// visible at once so a visitor self-selects without waiting for a carousel to
// come round. Panels stack vertically on a phone, where side-by-side would
// leave each one too narrow to read.
//
// Sits below the main banner image, where the stats row used to be.

import Link from "next/link";
import { ChefHat, Building2, ArrowRight } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { PHOTOS } from "@/mock/photos";

/**
 * Panel height — the one value to change when the hero needs to be taller or
 * shorter. Same `clamp(min, preferred, max)` shape as BANNER_HEIGHT in
 * Banner.jsx: the middle term tracks the viewport so the proportions hold at
 * every width, the floor keeps it usable on a phone, the ceiling keeps it from
 * dominating a wide screen. Tracks 26vw rather than 44vw because each panel is
 * now half the width it was as a full-bleed slide.
 */
const PANEL_HEIGHT = "clamp(320px, 26vw, 460px)";

const PANELS = [
  {
    id: "candidate",
    href: "/signUp?role=candidate",
    icon: ChefHat,
    titleKey: "home.lookingForJob",
    descKey: "home.lookingForJobDesc",
    image: PHOTOS.chefPlating,
    // Kept dark enough for white text to pass contrast, light enough that the
    // photograph is clearly a photograph rather than a tinted block.
    overlay: "from-brand-dark/80 via-brand-dark/45 to-black/55",
  },
  {
    id: "employer",
    href: "/signUp?role=employer",
    icon: Building2,
    titleKey: "home.iAmEmployer",
    descKey: "home.iAmEmployerDesc",
    image: PHOTOS.diningRoom,
    overlay: "from-accent-dark/80 via-accent-dark/45 to-black/55",
  },
];

export default function SplitHero() {
  const t = useT();

  return (
    <section className="px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-4 overflow-hidden md:grid-cols-2">
        {PANELS.map(({ id, href, icon: Icon, titleKey, descKey, image, overlay }) => (
          <Link
            key={id}
            href={href}
            style={{ height: PANEL_HEIGHT }}
            className="group relative flex items-center justify-center overflow-hidden rounded-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt=""
              style={{ objectPosition: image.focus }}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${overlay}`} />

            <div className="relative z-10 flex max-w-md flex-col items-center px-6 text-center text-white">
              <span className="mb-4 rounded-2xl bg-white/20 p-3 backdrop-blur-sm sm:p-4">
                <Icon size={32} strokeWidth={1.75} />
              </span>
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                {t(titleKey)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                {t(descKey)}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition group-hover:gap-3 sm:px-6 sm:py-3">
                {t("home.getStarted")}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
