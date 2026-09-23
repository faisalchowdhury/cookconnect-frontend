"use client";

// Offer card. Two Change Requirements rules are encoded here:
//
// 03 "Sign-Up Button on Offers": every card shown to a signed-out visitor
//    carries its own prominent Sign Up button, to maximise registrations.
//
// 03 "Smart Redirect on Click": the card body and the single action button both
//    go through `requireAuth`, so a guest gets the signup gate and a signed-in
//    user proceeds normally. There is deliberately no separate Apply button
//    next to the Sign Up one — the client asked for one button, not two.
//
// Applying is candidate-only: an employer browsing the board gets "View offer"
// where a candidate gets "Apply now". The card body stays clickable for them,
// since reading a competitor's offer is allowed.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Briefcase, CalendarDays, Clock, BadgeCheck, Bookmark } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { useSignupGate } from "@/app/component/ui/SignupGate";
import { useSession } from "@/lib/session";
import { getCity } from "@/mock/cities";
import { REQUIREMENT_BY_ID, EXPERIENCE_LEVELS, CONTRACT_TYPES } from "@/mock/jobOptions";
import { daysLeft } from "@/mock/jobs";
import { toggleSaveJob } from "@/mock/api";

export default function JobCard({ job, initiallySaved = false }) {
  const t = useT();
  const { pick } = useLocale();
  const router = useRouter();
  const { requireAuth, isLoggedIn } = useSignupGate();
  const { isEmployer } = useSession();

  const href = `/allJobs/${job.id}`;
  const city = getCity(job.city);
  const experience = EXPERIENCE_LEVELS.find((e) => e.id === job.experience);
  // API offers carry daysLeft computed against the real clock; fixtures fall back
  // to the demo's frozen date.
  const remaining = job.daysLeft ?? daysLeft(job);
  const isNew = remaining > 50;

  // A local toggle only counts while the prop it started from is unchanged, so a
  // refreshed `initiallySaved` wins without syncing state inside an effect.
  const [local, setLocal] = useState({ base: initiallySaved, value: initiallySaved });
  const saved = local.base === initiallySaved ? local.value : initiallySaved;
  const setSaved = (value) => setLocal({ base: initiallySaved, value });

  const open = requireAuth(() => router.push(href));

  const save = requireAuth(async (event) => {
    event?.stopPropagation?.();
    if (isEmployer) return;
    const next = !saved;
    setSaved(next);
    try {
      await toggleSaveJob(job.id, !next);
    } catch {
      setSaved(!next);
    }
  });

  const showBookmark = !isEmployer;

  return (
    <div
      onClick={open}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 font-poppins shadow-sm transition hover:border-brand/40 hover:shadow-md"
    >
      {isNew && (
        <span
          className={`absolute end-4 rounded bg-brand px-2 py-0.5 text-[11px] font-semibold text-white ${
            showBookmark ? "top-12" : "top-4"
          }`}
        >
          {t("notifications.new")}
        </span>
      )}

      {showBookmark && (
        <button
          onClick={save}
          aria-label={t("jobs.saveJob")}
          title={saved ? t("jobs.jobSaved") : t("jobs.saveJob")}
          className={`absolute end-4 top-4 z-10 rounded-md p-1.5 transition ${
            saved ? "bg-brand-soft text-brand" : "text-gray-300 hover:bg-gray-50 hover:text-brand"
          }`}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pe-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={job.logo} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {pick(job, "title")}
          </h3>
          <p className="truncate text-sm text-gray-600">{job.employerName}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {pick(city)}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={14} /> {pick(experience)}
        </span>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {/* Abbreviated: the card tag sits beside the salary and has no room
            for the full contract wording. */}
        <Tag>{pick(CONTRACT_TYPES.find((c) => c.id === job.contractType), "short")}</Tag>
        <Tag>
          {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()} {job.currency}
        </Tag>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-700">
        {pick(job, "description")}
      </p>

      {/* First two requirements */}
      {job.requirements?.length > 0 && (
        <ul className="mt-3 space-y-1">
          {job.requirements.slice(0, 2).map((id) => {
            const req = REQUIREMENT_BY_ID[id];
            if (!req) return null;
            return (
              <li key={id} className="flex items-center gap-1.5 text-sm text-gray-600">
                <BadgeCheck size={14} className="shrink-0 text-brand" />
                {pick(req)}
              </li>
            );
          })}
          {job.requirements.length > 2 && (
            <li className="text-sm font-medium text-accent">
              +{job.requirements.length - 2}
            </li>
          )}
        </ul>
      )}

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <CalendarDays size={13} /> {t("jobs.postedOn")} {job.postedAt}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {t("jobs.expiresIn", { n: Math.max(0, remaining) })}
          </span>
        </div>

        {/* One action only. Guests get Sign Up, employers get View offer,
            candidates get Apply. */}
        {isEmployer ? (
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md border border-gray-300 px-5 py-2 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {t("common.seeOffer")}
          </Link>
        ) : isLoggedIn ? (
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md bg-accent px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("common.applyNow")}
          </Link>
        ) : (
          <Link
            href="/signUp"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md bg-accent px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("nav.signUp")}
          </Link>
        )}
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded bg-brand-soft px-2 py-1 text-[11px] font-medium text-brand-dark">
      {children}
    </span>
  );
}
