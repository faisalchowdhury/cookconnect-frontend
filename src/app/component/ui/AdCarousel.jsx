"use client";

// Sliding advertising banner — Change Requirements section 04.
// Slides auto-rotate every ~3 seconds; used twice on the home page (middle and
// bottom). Must stay proportional on mobile, which the client flagged as the
// priority since most traffic is expected on phones.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useT } from "@/i18n/LocaleProvider";
import { AD_ROTATE_MS } from "@/mock/banners";
import { clickBanner, USE_API } from "@/mock/api";

const isApiBannerId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

export default function AdCarousel({ slides = [], className = "" }) {
  const t = useT();
  const { pick } = useLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AD_ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  return (
    <section className={`px-4 ${className}`} aria-label={t("home.advertising")}>
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-gray-400">
          {t("home.advertising")}
        </p>

        <div
          className="relative overflow-hidden rounded-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out rtl:flex-row-reverse"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide) => (
              <Link
                key={slide.id}
                href={slide.href || "#"}
                onClick={() => {
                  if (USE_API && isApiBannerId(slide.id)) {
                    clickBanner(slide.id).catch(() => {});
                  }
                }}
                className="relative flex w-full shrink-0 flex-col justify-center gap-2 overflow-hidden p-6 text-white sm:p-10"
                style={{ minHeight: "clamp(160px, 22vw, 220px)" }}
              >
                {/* The photo is the banner; the gradient sits on top of it as a
                    tint that is opaque behind the copy and fades to clear over
                    the rest of the frame, so the photograph stays visible
                    instead of being flattened under a colour wash. Previously
                    `slide.image` was carried in the data but never rendered,
                    which is why these strips showed a flat colour block. */}
                {slide.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.image.src}
                    alt=""
                    style={{ objectPosition: slide.image.focus }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l ${slide.bg}`}
                />

                <div className="relative z-10 flex flex-col gap-2">
                  <h3 className="text-lg font-bold sm:text-2xl">{pick(slide, "title")}</h3>
                  <p className="max-w-xl text-sm text-white/90 sm:text-base">{pick(slide, "subtitle")}</p>
                  <span className="mt-2 w-fit rounded-md bg-white/95 px-4 py-2 text-xs font-semibold text-gray-900 sm:text-sm">
                    {pick(slide, "cta")}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-3 start-6 flex gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => setIndex(i)}
                  aria-label={`${t("common.page")} ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
