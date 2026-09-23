"use client";

// Job management for an employer.
//
// Change Requirements section 09:
//  - offers expire automatically after 60 days and leave the active listing
//  - expired offers stay in the employer's history with their applicants
//  - the employer can republish an expired offer
//
// Change Requirements section 08:
//  - "Approved Offers — Green Badge": approved offers are clearly marked in
//    green so the pending queue is easy to scan.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Clock, CheckCircle2, RefreshCw, Users, Pencil, Archive,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchEmployerJobs, republishJob } from "@/mock/api";
import { getCity } from "@/mock/cities";
import { MAX_OFFER_DAYS } from "@/mock/jobs";
import EmptyState from "@/app/component/ui/EmptyState";

const TABS = [
  { id: "active", labelKey: "employer.activeOffers", icon: CheckCircle2 },
  { id: "pending", labelKey: "employer.pendingOffers", icon: Clock },
  { id: "expired", labelKey: "employer.expiredOffers", icon: Archive },
];

export default function JobManagementPage() {
  const t = useT();
  const { pick } = useLocale();

  const [jobs, setJobs] = useState(null);
  const [tab, setTab] = useState("active");
  const [republished, setRepublished] = useState([]);

  useEffect(() => {
    fetchEmployerJobs().then(setJobs);
  }, []);

  const republish = async (id) => {
    await republishJob(id);
    setRepublished((r) => [...r, id]);
  };

  const list = jobs?.[tab] ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-poppins">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("employer.myOffers")}</h1>
          <p className="mt-1 text-sm text-gray-600">{t("employer.deadlineHint")}</p>
        </div>
        <Link
          href="/jobPost"
          className="flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          <Plus size={16} />
          {t("employer.postJob")}
        </Link>
      </header>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-gray-200 p-1">
        {TABS.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === id ? "bg-brand text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon size={15} />
            {t(labelKey)}
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] font-semibold">
              {jobs?.[id].length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {list === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title={t("common.noResults")}
          action={
            <Link
              href="/jobPost"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              {t("employer.postJob")}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {list.map((job) => {
            const city = getCity(job.city);
            const isRepublished = republished.includes(job.id);

            return (
              <li key={job.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={job.logo} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {pick(job, "title")}
                      </p>
                      <p className="truncate text-sm text-gray-500">{pick(city)}</p>
                      <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-400">
                        <span>
                          {t("jobs.postedOn")} {job.postedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {t("jobs.applicants", { n: job.applicants })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <StatusBadge job={job} republished={isRepublished} t={t} />
                </div>

                {/* Countdown against the 60-day cap */}
                {tab === "active" && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span>{t("jobs.expiresIn", { n: Math.max(0, job.daysLeft) })}</span>
                      <span>
                        {MAX_OFFER_DAYS} {t("common.days")}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${
                          job.daysLeft <= 7 ? "bg-red-500" : "bg-brand"
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, (job.daysLeft / MAX_OFFER_DAYS) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <Link
                    href={`/allJobs/${job.id}`}
                    className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    {t("common.seeOffer")}
                  </Link>

                  <button className="flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50">
                    <Pencil size={14} />
                    {t("employer.edit")}
                  </button>

                  <Link
                    href="/saveProfile"
                    className="flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <Users size={14} />
                    {t("employer.viewApplicants")}
                  </Link>

                  {/* Republish is only offered once an offer has expired. */}
                  {tab === "expired" && (
                    <button
                      onClick={() => republish(job.id)}
                      disabled={isRepublished}
                      className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
                    >
                      <RefreshCw size={14} />
                      {isRepublished ? t("employer.republished") : t("employer.republish")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ job, republished, t }) {
  if (republished) {
    return <Badge tone="amber">{t("employer.pending")}</Badge>;
  }
  if (job.status === "pending") {
    return <Badge tone="amber">{t("employer.pending")}</Badge>;
  }
  if (job.status === "expired" || job.expired) {
    return <Badge tone="gray">{t("jobs.expired")}</Badge>;
  }
  // Approved offers are marked green, per Change Requirements 08.
  return <Badge tone="green">{t("employer.approved")}</Badge>;
}

const BADGE_TONES = {
  green: "bg-brand-soft text-brand-dark",
  amber: "bg-amber-50 text-amber-700",
  gray: "bg-gray-100 text-gray-500",
};

function Badge({ tone, children }) {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}
