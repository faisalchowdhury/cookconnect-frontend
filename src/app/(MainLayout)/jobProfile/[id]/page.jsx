"use client";

// Candidate profile detail.
//
// Change Requirements 13 "Candidate Contact Privacy": the phone number is only
// attached by the mock API when the viewer is a signed-in employer, and every
// reveal is framed as a logged action. A guest never receives it at all.
//
// Change Requirements 10: the Save/bookmark control is available here too.

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Briefcase, Clock, BadgeCheck, Bookmark,
  Phone, Mail, GraduationCap, Building2, Lock, FileText,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { useSignupGate } from "@/app/component/ui/SignupGate";
import { fetchCandidate, fetchSavedProfileIds, toggleSaveProfile, USE_API } from "@/mock/api";
import { useTaxonomyVersion } from "@/components/TaxonomyHydrator";
import { getCity } from "@/mock/cities";
import { EXPERIENCE_LEVELS, AVAILABILITY, REQUIREMENT_BY_ID } from "@/mock/jobOptions";
import { POSITION_BY_ID } from "@/mock/sectors";
import { SAVED_PROFILES } from "@/mock/applications";
import EmptyState from "@/app/component/ui/EmptyState";

export default function CandidateDetailPage() {
  const t = useT();
  const { pick } = useLocale();
  const taxonomyVersion = useTaxonomyVersion();
  const { id } = useParams();
  const { isEmployer } = useSession();
  const { requireAuth } = useSignupGate();

  const [candidate, setCandidate] = useState(undefined);
  const [revealed, setRevealed] = useState(false);
  const [initiallySaved, setInitiallySaved] = useState(
    USE_API ? false : SAVED_PROFILES.some((s) => s.candidateId === id)
  );

  // Whether the profile is already bookmarked is derived from the data, not
  // copied into state by an effect; `savedOverride` only records a change the
  // user makes on this page.
  const [savedOverride, setSavedOverride] = useState(null);
  const saved = savedOverride ?? initiallySaved;

  useEffect(() => {
    let alive = true;
    fetchCandidate(id, { asEmployer: isEmployer }).then((data) => {
      if (alive) setCandidate(data);
    });
    return () => {
      alive = false;
    };
  }, [id, isEmployer]);

  useEffect(() => {
    if (!isEmployer) return undefined;
    let alive = true;
    fetchSavedProfileIds().then((ids) => {
      if (alive) setInitiallySaved(ids.has(String(id)));
    });
    return () => {
      alive = false;
    };
  }, [id, isEmployer]);

  const save = requireAuth(async () => {
    const next = !saved;
    setSavedOverride(next);
    await toggleSaveProfile(id, next);
  });

  const reveal = requireAuth(() => setRevealed(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- POSITION_BY_ID is a module-level lookup the API hydrates; the version forces a re-read
  const positionById = useMemo(() => POSITION_BY_ID, [taxonomyVersion]);

  if (candidate === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title={t("common.noResults")} />
      </div>
    );
  }

  const city = getCity(candidate.city);
  const experience = EXPERIENCE_LEVELS.find((e) => e.id === candidate.experience);
  const availability = AVAILABILITY.find((a) => a.id === candidate.availability);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 font-poppins">
      <Link
        href="/jobProfile"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-accent"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("common.back")}
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={candidate.photo}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
            <div>
              <h1 className="flex items-center gap-1.5 text-xl font-bold text-gray-900 sm:text-2xl">
                {candidate.name}
                {candidate.verified && <BadgeCheck size={18} className="text-brand" />}
              </h1>
              <p className="mt-0.5 text-sm text-gray-600">
                {pick(candidate, "title")}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
                <Meta icon={MapPin}>{pick(city)}</Meta>
                <Meta icon={Briefcase}>{pick(experience)}</Meta>
                <Meta icon={Clock}>{pick(availability)}</Meta>
              </div>
            </div>
          </div>

          <button
            onClick={save}
            className={`flex shrink-0 items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium transition ${
              saved
                ? "border-brand bg-brand-soft text-brand-dark"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            {saved ? t("candidates.profileSaved") : t("candidates.saveProfile")}
          </button>
        </div>

        {/* Contact — gated */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          {revealed && candidate.phone ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Meta icon={Phone}>{candidate.phone}</Meta>
              <Meta icon={Mail}>{candidate.email}</Meta>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                <Lock size={14} />
                {t("profile.contactHidden")}
              </p>
              <button
                onClick={reveal}
                className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                {t("candidates.contactRequest")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <Panel title={t("profile.about")}>
        <p className="text-sm leading-relaxed text-gray-700">{pick(candidate, "about")}</p>
      </Panel>

      {/* Skills */}
      {candidate.skills?.length > 0 && (
        <Panel title={t("profile.skills")}>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skillId) => {
              const skill = REQUIREMENT_BY_ID[skillId];
              if (!skill) return null;
              return (
                <span
                  key={skillId}
                  className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-dark"
                >
                  {pick(skill)}
                </span>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Training */}
      {candidate.training?.length > 0 && (
        <Panel title={t("profile.training")}>
          <ul className="space-y-4">
            {candidate.training.map((row, i) => (
              <TimelineRow
                key={i}
                icon={GraduationCap}
                title={row.diploma}
                subtitle={row.school}
                period={`${row.from} – ${row.to}`}
              />
            ))}
          </ul>
        </Panel>
      )}

      {/* Work history */}
      {candidate.history?.length > 0 && (
        <Panel title={t("profile.workHistory")}>
          <ul className="space-y-4">
            {candidate.history.map((row, i) => (
              <TimelineRow
                key={i}
                icon={Building2}
                title={pick(positionById[row.positionId])}
                subtitle={row.establishment}
                period={`${row.from} – ${row.to}`}
              />
            ))}
          </ul>
        </Panel>
      )}

      {/* Food photos */}
      {candidate.foodPhotos?.length > 0 && (
        <Panel title={t("profile.foodPhotos")}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {candidate.foodPhotos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        </Panel>
      )}

      {candidate.hasCv && (
        <Panel title={t("profile.cv")}>
          <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            <FileText size={15} className="text-brand" />
            CV — {candidate.name}.pdf
          </span>
        </Panel>
      )}
    </div>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-gray-600">
      <Icon size={14} />
      {children}
    </span>
  );
}

function Panel({ title, children }) {
  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function TimelineRow({ icon: Icon, title, subtitle, period }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
        <p className="text-xs text-gray-400">{period}</p>
      </div>
    </li>
  );
}
