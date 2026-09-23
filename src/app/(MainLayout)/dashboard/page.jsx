"use client";

// Candidate dashboard — built to the "Dashboard" Figma screen.
//
// Layout: a greeting, four headline cards, then a two-column body — My Profile
// and Quick Actions on the left, My Applications on the right.
//
// The completeness meter doubles as the entry point to the "Incomplete Profile"
// flow from Change Requirements section 06, which is why the incomplete state
// gets its own call to action inside the profile card rather than only a
// coloured bar.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Clock,
  Eye,
  Pencil,
  Search,
  Users,
  User,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  fetchCurrentCandidate,
  fetchMyApplications,
  fetchFeaturedJobs,
  fetchMyStats,
} from "@/mock/api";
import { getProfileCompletion } from "@/lib/profileCompletion";
import { APPLICATION_STATUS } from "@/mock/applications";
import EmptyState from "@/app/component/ui/EmptyState";
import JobCard from "@/app/component/allJobs/JobCard";

const STATUS_TONES = {
  amber: "bg-amber-50 text-amber-700",
  green: "bg-brand-soft text-brand-dark",
  red: "bg-red-50 text-red-600",
};

const CARD_TONES = {
  blue: "bg-blue-50 text-blue-500",
  green: "bg-emerald-50 text-emerald-500",
  amber: "bg-amber-50 text-amber-500",
};

/** One of the four headline cards across the top. */
function StatCard({ icon: Icon, tone, value, label }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
      <span
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${CARD_TONES[tone]}`}
      >
        <Icon size={26} strokeWidth={1.75} />
      </span>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

/** Panel with the small icon + title header the design uses on both columns. */
function Panel({ icon: Icon, title, action, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <h2 className="flex items-center gap-2.5 font-medium text-gray-900">
          {Icon && <Icon size={19} strokeWidth={1.75} className="text-gray-700" />}
          {title}
        </h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Full-width outlined button — "Edit my profile", "Search for offers", … */
function ActionLink({ icon: Icon, href, children }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
    >
      <Icon size={17} strokeWidth={1.75} />
      {children}
    </Link>
  );
}

export default function CandidateDashboard() {
  const t = useT();
  const { pick, locale } = useLocale();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState(null);
  const [stats, setStats] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    fetchCurrentCandidate().then(setProfile);
    fetchMyApplications().then(setApplications);
    fetchMyStats().then(setStats);
    fetchFeaturedJobs(3).then(setRecommended);
  }, []);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);

  // Applications are dated ISO in the fixtures; the design shows a short
  // numeric date, which each locale formats its own way.
  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [locale]
  );

  const formatDate = (iso) => (iso ? dateFormat.format(new Date(iso)) : "—");

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 font-poppins">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {profile ? t("dashboard.welcome", { name: profile.firstName }) : t("dashboard.title")}
          </h1>
          <p className="mt-2 text-gray-500">{t("dashboard.subtitle")}</p>
        </header>

        {/* Headline cards */}
        <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            tone="blue"
            value={`${completion.percent}%`}
            label={t("dashboard.stats.completeProfile")}
          />
          <StatCard
            icon={Eye}
            tone="green"
            value={stats ? stats.views : "—"}
            label={t("dashboard.stats.profileViews")}
          />
          <StatCard
            icon={Briefcase}
            tone="amber"
            value={applications ? applications.length : "—"}
            label={t("dashboard.stats.applications")}
          />
          <StatCard
            icon={Award}
            tone="green"
            value={
              profile
                ? t(profile.verified ? "dashboard.stats.verified" : "dashboard.stats.pending")
                : "—"
            }
            label={t("dashboard.stats.profileStatus")}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6">
            <Panel icon={User} title={t("dashboard.myProfile")}>
              <p className="text-sm text-gray-600">{t("dashboard.completeProfile")}</p>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    completion.isComplete ? "bg-blue-600" : "bg-amber-500"
                  }`}
                  style={{ width: `${completion.percent}%` }}
                />
              </div>

              <p
                className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                  profile?.verified ? "text-brand" : "text-gray-400"
                }`}
              >
                <Award size={17} strokeWidth={1.75} />
                {t(profile?.verified ? "dashboard.verifiedProfile" : "dashboard.notVerified")}
              </p>

              {/* Change Requirements 06: an incomplete profile cannot apply, so
                  it is called out here rather than only implied by the bar. */}
              {profile && !completion.isComplete && (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  {t("profile.incompleteBody")}
                </p>
              )}

              <div className="mt-5 space-y-3">
                <ActionLink icon={Pencil} href="/editProfile">
                  {t("dashboard.editProfile")}
                </ActionLink>
                <ActionLink icon={Eye} href={profile ? `/jobProfile/${profile.id}` : "/editProfile"}>
                  {t("dashboard.viewPublicProfile")}
                </ActionLink>
              </div>
            </Panel>

            <Panel icon={User} title={t("dashboard.quickActions")}>
              <div className="space-y-3">
                <ActionLink icon={Eye} href="/allCooks">
                  {t("dashboard.viewProfiles")}
                </ActionLink>
                <ActionLink icon={Search} href="/allJobs">
                  {t("dashboard.searchOffers")}
                </ActionLink>
              </div>
            </Panel>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2">
            <Panel
              icon={Briefcase}
              title={t("dashboard.myApplications")}
              action={
                <Link
                  href="/allJobs"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  {t("dashboard.seeAllOffers")}
                </Link>
              }
            >
              {applications === null ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <EmptyState
                  title={t("dashboard.noApplications")}
                  action={
                    <Link
                      href="/allJobs"
                      className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      {t("dashboard.browseOffers")}
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-4">
                  {applications.map((app) => {
                    const status = APPLICATION_STATUS[app.status];
                    return (
                      <li
                        key={app.id}
                        className="rounded-xl border border-gray-200 p-5 transition hover:border-gray-300"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className="font-medium text-gray-900">{pick(app.job, "title")}</p>
                          <Link
                            href={`/allJobs/${app.jobId}`}
                            className="rounded-full bg-blue-50 px-5 py-1.5 text-sm text-blue-600 transition hover:bg-blue-100"
                          >
                            {t("common.view")}
                          </Link>
                        </div>

                        <p className="mt-2 text-gray-500">{app.job?.employerName}</p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={16} strokeWidth={1.75} />
                            {t("dashboard.appliedOn", { date: formatDate(app.appliedAt) })}
                            {status && (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  STATUS_TONES[status.tone]
                                }`}
                              >
                                {pick(status)}
                              </span>
                            )}
                          </span>

                          <Link
                            href={`/allJobs/${app.jobId}`}
                            className="text-sm font-medium text-brand hover:underline"
                          >
                            {t("common.seeOffer")}
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </div>

        {/* Kept from the previous dashboard: the Figma has no recommendations
            block, but removing a working feature was not the ask. */}
        {recommended.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.recommended")}</h2>
              <Link
                href="/allJobs"
                className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                {t("home.seeAllOffers")}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
