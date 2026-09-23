"use client";

// Candidate profile card.
//
// Change Requirements 10 "Save Button on Profiles": every candidate card gets a
// Save/Bookmark control so an employer can build a shortlist without posting a
// job and without the candidate applying.
//
// Change Requirements 03: a guest clicking the card gets the signup gate.
// Change Requirements 13: the phone number is never rendered here.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Briefcase, BadgeCheck, Bookmark, Clock } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { useSignupGate } from "@/app/component/ui/SignupGate";
import { getCity } from "@/mock/cities";
import { EXPERIENCE_LEVELS, AVAILABILITY } from "@/mock/jobOptions";
import { toggleSaveProfile } from "@/mock/api";

export default function CandidateCard({ candidate, initiallySaved = false }) {
  const t = useT();
  const { pick } = useLocale();
  const router = useRouter();
  const { requireAuth } = useSignupGate();

  // A local toggle only counts while the prop it started from is unchanged, so a
  // refreshed `initiallySaved` wins without syncing state inside an effect.
  const [local, setLocal] = useState({ base: initiallySaved, value: initiallySaved });
  const saved = local.base === initiallySaved ? local.value : initiallySaved;
  const setSaved = (value) => setLocal({ base: initiallySaved, value });

  const city = getCity(candidate.city);
  const experience = EXPERIENCE_LEVELS.find((e) => e.id === candidate.experience);
  const availability = AVAILABILITY.find((a) => a.id === candidate.availability);

  const open = requireAuth(() => router.push(`/jobProfile/${candidate.id}`));

  const save = requireAuth(async (event) => {
    event?.stopPropagation?.();
    const next = !saved;
    setSaved(next);
    await toggleSaveProfile(candidate.id, next);
  });

  return (
    <div
      onClick={open}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 font-poppins shadow-sm transition hover:border-brand/40 hover:shadow-md"
    >
      {/* Save / bookmark */}
      <button
        onClick={save}
        aria-label={t("candidates.saveProfile")}
        title={saved ? t("candidates.profileSaved") : t("candidates.saveProfile")}
        className={`absolute end-4 top-4 rounded-md p-1.5 transition ${
          saved ? "bg-brand-soft text-brand" : "text-gray-300 hover:bg-gray-50 hover:text-brand"
        }`}
      >
        <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
      </button>

      <div className="flex items-start gap-3 pe-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={candidate.photo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-semibold text-gray-900">
            {candidate.name}
            {candidate.verified && (
              <BadgeCheck size={15} className="shrink-0 text-brand" title={t("candidates.verified")} />
            )}
          </p>
          <p className="truncate text-sm text-gray-600">
            {pick(candidate, "title")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {pick(city)}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={14} /> {pick(experience)}
        </span>
      </div>

      {candidate.availability === "immediate" && (
        <span className="mt-3 w-fit rounded bg-brand-soft px-2 py-1 text-[11px] font-medium text-brand-dark">
          {t("candidates.availableNow")}
        </span>
      )}

      <p className="mt-3 line-clamp-2 text-sm text-gray-700">{pick(candidate, "about")}</p>

      {/* Food photo strip, when the role is eligible */}
      {candidate.foodPhotos?.length > 0 && (
        <div className="mt-3 flex gap-1.5">
          {candidate.foodPhotos.slice(0, 4).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="h-11 w-11 rounded object-cover" />
          ))}
          {candidate.foodPhotos.length > 4 && (
            <span className="flex h-11 w-11 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500">
              +{candidate.foodPhotos.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={13} /> {pick(availability)}
        </span>
        <span className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-accent-dark">
          {t("common.seeProfile")}
        </span>
      </div>
    </div>
  );
}
