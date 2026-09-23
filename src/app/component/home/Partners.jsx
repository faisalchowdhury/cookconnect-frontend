"use client";

// "They trust us" — a continuously scrolling strip of partner establishments.
//
// The scroll is a pure CSS translate on a track containing the list twice: at
// -50% the second copy sits exactly where the first started, so restarting the
// animation is invisible and there is no JS timer, no resize listener and no
// re-render per frame. Duration scales with the number of partners, so adding
// one keeps the same reading speed rather than making the whole strip faster.
//
// Motion is suspended on hover and for `prefers-reduced-motion`, and runs the
// other way round in Arabic, where a left-drifting strip reads backwards — see
// the marquee-rtl keyframe in tailwind.config.js for why that is a separate
// animation rather than `animation-direction: reverse`.

import { PARTNERS } from "@/mock/partners";
import { useLocale, useT } from "@/i18n/LocaleProvider";

/** Seconds each partner spends crossing the strip. */
const SECONDS_PER_PARTNER = 4;

export default function Partners({ partners = PARTNERS }) {
  const t = useT();

  // Two copies back to back — see the -50% keyframe in tailwind.config.js.
  // Card spacing is a trailing margin on each card rather than `gap` on the
  // track, so every card occupies exactly the same width and half the track is
  // exactly one full copy.
  const track = [...partners, ...partners];
  const duration = `${partners.length * SECONDS_PER_PARTNER}s`;

  return (
    <section className="overflow-hidden bg-white px-4 py-14 font-poppins">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("home.partners")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
          {t("home.partnersSubtitle")}
        </p>
      </div>

      {/* The fades hide the point where a card enters and leaves the viewport,
          so the strip reads as continuous rather than as cards popping in. */}
      <div className="group relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-white to-transparent rtl:bg-gradient-to-l sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-white to-transparent rtl:bg-gradient-to-r sm:w-28" />

        <ul
          style={{ animationDuration: duration }}
          className="flex w-max animate-marquee items-stretch group-hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused] rtl:animate-marquee-rtl"
        >
          {track.map((partner, i) => (
            <PartnerCard
              key={`${partner.id}-${i}`}
              partner={partner}
              // The second copy exists only to make the loop seamless; it is the
              // same content read twice, so screen readers should skip it.
              ariaHidden={i >= partners.length}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PartnerCard({ partner, ariaHidden }) {
  const { pick } = useLocale();
  const { name, color, mark, logo } = partner;

  return (
    <li
      aria-hidden={ariaHidden || undefined}
      className="me-4 flex w-56 shrink-0 flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-6 opacity-70 grayscale transition duration-300 hover:border-gray-300 hover:opacity-100 hover:shadow-sm hover:grayscale-0"
    >
      {logo ? (
        // Real partner artwork, once the client supplies it.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} className="h-10 w-auto max-w-[140px] object-contain" />
      ) : (
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ color, backgroundColor: `${color}1A` }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={mark} />
          </svg>
        </span>
      )}

      <span className="text-center">
        <span className="block text-sm font-semibold leading-tight text-gray-900">{name}</span>
        <span className="mt-1 block text-[11px] uppercase tracking-wide text-gray-500">
          {pick(partner, "kind")} · {pick(partner, "city")}
        </span>
      </span>
    </li>
  );
}
