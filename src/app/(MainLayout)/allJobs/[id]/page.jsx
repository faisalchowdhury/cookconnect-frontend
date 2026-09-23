"use client";

// Job offer detail.
//
// Change Requirements 03 "Smart Redirect on Click": a single Apply button.
// Guests get the signup gate; signed-in candidates with an incomplete profile
// get the "Incomplete Profile" banner and are sent to Edit My Profile
// (Change Requirements 06); everyone else applies.
//
// Applying is a candidate-only action. An employer may read any offer — their
// own or a competitor's — but never gets an Apply button, so the profile gate
// below is only ever evaluated for a candidate profile that actually exists.

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Briefcase, CalendarDays, Clock, ArrowLeft, Check,
  AlertTriangle, Building2, Wallet, Eye, Bookmark,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { useSignupGate } from "@/app/component/ui/SignupGate";
import {
  fetchJob,
  fetchCurrentCandidate,
  applyToJob,
  fetchBookmarkJobIds,
  toggleSaveJob,
} from "@/mock/api";
import { getCity } from "@/mock/cities";
import {
  REQUIREMENT_BY_ID, BENEFIT_BY_ID, EXPERIENCE_LEVELS,
  CONTRACT_TYPES, ESTABLISHMENT_TYPES,
} from "@/mock/jobOptions";
import { SelectedList } from "@/app/component/ui/CheckboxGroup";
import { getProfileCompletion } from "@/lib/profileCompletion";
import EmptyState from "@/app/component/ui/EmptyState";

export default function JobDetailPage() {
  const t = useT();
  const { pick } = useLocale();
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoggedIn, isCandidate, isEmployer } = useSession();
  const { requireAuth } = useSignupGate();

  const [job, setJob] = useState(undefined);
  // `undefined` means "not fetched yet", distinct from `null` meaning "no
  // candidate profile". getProfileCompletion() scores both as 0%, so without
  // the distinction a click during the fetch reads as an incomplete profile.
  const [profile, setProfile] = useState(undefined);
  const [applied, setApplied] = useState(false);
  const [incomplete, setIncomplete] = useState(false);
  // Bookmark state is tagged with the account + offer it belongs to, so signing
  // out or switching offers falls back to "not saved" without an effect reset.
  const bookmarkKey = isLoggedIn && isCandidate ? `${user?.id || "candidate"}:${id}` : null;
  const [bookmark, setBookmark] = useState({ key: null, initial: false, override: null });

  useEffect(() => {
    fetchJob(id)
      .then(setJob)
      .catch(() => setJob(null));
  }, [id]);

  useEffect(() => {
    if (isCandidate) fetchCurrentCandidate().then(setProfile);
  }, [isCandidate]);

  useEffect(() => {
    if (!bookmarkKey) return undefined;
    let alive = true;
    fetchBookmarkJobIds()
      .then((ids) => {
        if (!alive) return;
        setBookmark((b) => ({
          key: bookmarkKey,
          initial: ids.has(String(id)),
          override: b.key === bookmarkKey ? b.override : null,
        }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [bookmarkKey, id]);

  const current = bookmark.key === bookmarkKey ? bookmark : null;
  const saved = current ? current.override ?? current.initial : false;
  const setSavedOverride = (value) =>
    setBookmark((b) => ({
      key: bookmarkKey,
      initial: b.key === bookmarkKey ? b.initial : false,
      override: value,
    }));

  const save = requireAuth(async () => {
    if (isEmployer) return;
    const next = !saved;
    setSavedOverride(next);
    try {
      await toggleSaveJob(id, saved);
    } catch {
      setSavedOverride(saved);
    }
  });

  const apply = requireAuth(async () => {
    // A visitor can click Apply before the profile request settles. Reading the
    // state here would score an unloaded profile as 0% and show a complete
    // candidate the "Incomplete Profile" banner, so fetch it on demand instead
    // of trusting whatever state happens to hold at click time. Only the narrow
    // race window pays for the extra call; every other click reads the state.
    const current = profile === undefined ? await fetchCurrentCandidate() : profile;

    const completion = getProfileCompletion(current);
    if (!completion.isComplete) {
      setIncomplete(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    await applyToJob(job.id);
    setApplied(true);
  });

  if (job === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title={t("common.noResults")} />
      </div>
    );
  }

  const city = getCity(job.city);
  const experience = EXPERIENCE_LEVELS.find((e) => e.id === job.experience);
  const contract = CONTRACT_TYPES.find((c) => c.id === job.contractType);
  const establishment = ESTABLISHMENT_TYPES.find((e) => e.id === job.establishmentType);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 font-poppins">
      <Link
        href="/allJobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-accent"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("common.back")}
      </Link>

      {/* Incomplete profile warning (Change Req 06) */}
      {incomplete && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-semibold">{t("profile.incompleteTitle")}</strong> —{" "}
              {t("profile.incompleteBody")}
            </span>
          </p>
          <button
            onClick={() => router.push("/editProfile")}
            className="mt-3 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            {t("profile.incompleteCta")}
          </button>
        </div>
      )}

      {applied && (
        <div className="mb-6 rounded-lg border border-brand/30 bg-brand-soft p-4">
          <p className="flex items-start gap-2 text-sm text-brand-dark">
            <Check size={17} className="mt-0.5 shrink-0" strokeWidth={3} />
            <span>
              <strong className="font-semibold">{t("jobs.applied")}</strong> — {t("jobs.appliedBody")}
            </span>
          </p>
        </div>
      )}

      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={job.logo} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {pick(job, "title")}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{job.employerName}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
                <Meta icon={MapPin}>{pick(city)}</Meta>
                <Meta icon={Briefcase}>{pick(experience)}</Meta>
                <Meta icon={Building2}>{pick(establishment)}</Meta>
                <Meta icon={Clock}>{pick(contract)}</Meta>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <p className="flex items-center gap-1.5 text-lg font-bold text-gray-900 sm:justify-end">
              <Wallet size={17} className="text-brand" />
              {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {job.currency} {t("common.perMonth")}
            </p>
            {!isEmployer && (
              <button
                onClick={save}
                className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium transition ${
                  saved
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
                {saved ? t("jobs.jobSaved") : t("jobs.saveJob")}
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <Meta icon={CalendarDays}>
            {t("jobs.postedOn")} {job.postedAt}
          </Meta>
          <Meta icon={Clock}>
            {job.expired
              ? t("jobs.expired")
              : t("jobs.expiresIn", { n: Math.max(0, job.daysLeft) })}
          </Meta>
          <span>{t("jobs.applicants", { n: job.applicants })}</span>
        </div>

        {/* The single action button — no separate Sign Up next to it.
            An employer gets a read-only notice in its place. */}
        <div className="mt-5">
          {isEmployer ? (
            <p className="flex items-start gap-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
              <Eye size={16} className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-semibold text-gray-800">
                  {t("jobs.employerViewOnly")}
                </strong>{" "}
                — {t("jobs.employerViewOnlyBody")}
              </span>
            </p>
          ) : applied ? (
            <button
              disabled
              className="w-full cursor-default rounded-md bg-brand-soft py-3 text-sm font-semibold text-brand-dark sm:w-auto sm:px-10"
            >
              {t("jobs.applied")}
            </button>
          ) : (
            <button
              onClick={apply}
              className="w-full rounded-md bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-dark sm:w-auto sm:px-10"
            >
              {isLoggedIn ? t("common.applyNow") : t("jobs.signUpToApply")}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <Panel title={t("common.description")}>
        <p className="text-sm leading-relaxed text-gray-700">
          {pick(job, "description")}
        </p>
      </Panel>

      {/* Requirements + benefits, rendered from the stored option ids */}
      <Panel title={t("common.requirements")}>
        <SelectedList
          ids={job.requirements}
          lookup={REQUIREMENT_BY_ID}
          emptyLabel={t("common.noResults")}
        />
      </Panel>

      <Panel title={t("common.benefits")}>
        <SelectedList ids={job.benefits} lookup={BENEFIT_BY_ID} emptyLabel={t("common.noResults")} />
      </Panel>
    </div>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1">
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
