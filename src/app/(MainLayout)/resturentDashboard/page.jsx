"use client";

// Employer dashboard.
//
// Change Requirements 08: a "Post a Job" button sits next to "Find the Best
// Profiles", and "Find the Best Profiles" leads to the profile filters.
//
// Change Requirements 10: the dashboard shows two distinct candidate sources —
// people who applied to an offer, and profiles the employer saved while
// browsing without any application involved.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase, Users, Eye, Bookmark, Plus, Search,
  Clock, CheckCircle2, ArrowRight,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  fetchEmployerJobs,
  fetchEmployerCandidates,
  fetchCurrentEmployer,
  fetchEmployerDashboard,
  updateApplicationStatus,
} from "@/mock/api";
import { APPLICATION_STATUS } from "@/mock/applications";
import { getCity } from "@/mock/cities";
import { Select } from "@/app/component/ui/Fields";
import EmptyState from "@/app/component/ui/EmptyState";

const TONES = {
  amber: "bg-amber-50 text-amber-700",
  green: "bg-brand-soft text-brand-dark",
  red: "bg-red-50 text-red-600",
};

const STATUS_OPTIONS = Object.entries(APPLICATION_STATUS).map(([id, labels]) => ({
  id,
  fr: labels.fr,
  ar: labels.ar,
  en: labels.en,
}));

export default function EmployerDashboard() {
  const t = useT();
  const { pick } = useLocale();

  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [people, setPeople] = useState(null);
  const [tab, setTab] = useState("applicants");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [counters, setCounters] = useState(null);

  useEffect(() => {
    fetchCurrentEmployer().then(setEmployer);
    fetchEmployerJobs().then(setJobs);
    fetchEmployerCandidates().then(setPeople);
    fetchEmployerDashboard().then(setCounters).catch(() => {});
  }, []);

  const stats = [
    { icon: Briefcase, value: jobs?.active.length ?? 0, labelKey: "employer.stats.activeOffers" },
    { icon: Users, value: people?.applicants.length ?? 0, labelKey: "employer.stats.applicants" },
    { icon: Eye, value: counters?.profileViews ?? 0, labelKey: "employer.stats.profileViews" },
    { icon: Bookmark, value: people?.saved.length ?? 0, labelKey: "employer.stats.savedProfiles" },
  ];

  const list = tab === "applicants" ? people?.applicants : people?.saved;

  const handleStatusChange = async (rowId, status) => {
    setStatusError("");
    setUpdatingId(rowId);
    try {
      await updateApplicationStatus(rowId, status);
      setPeople((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          applicants: prev.applicants.map((row) =>
            row.id === rowId ? { ...row, status } : row
          ),
        };
      });
    } catch {
      setStatusError(t("employer.statusUpdateError"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-poppins">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("employer.dashboard")}</h1>
          {employer && <p className="mt-1 text-sm text-gray-600">{employer.name}</p>}
        </div>

        {/* The two primary actions, side by side per Change Req 08. */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/jobProfile"
            className="flex items-center justify-center gap-2 rounded-md border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            <Search size={16} />
            {t("employer.findBestProfiles")}
          </Link>
          <Link
            href="/jobPost"
            className="flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            <Plus size={16} />
            {t("employer.postJob")}
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, value, labelKey }) => (
          <div key={labelKey} className="rounded-xl border border-gray-200 bg-white p-5">
            <Icon size={20} className="mb-3 text-brand" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm text-gray-600">{t(labelKey)}</p>
          </div>
        ))}
      </section>

      {/* Offers summary */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t("employer.myOffers")}</h2>
          <Link
            href="/totalJobPost"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            {t("common.seeMore")}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <OfferTile
            icon={CheckCircle2}
            tone="brand"
            label={t("employer.activeOffers")}
            value={jobs?.active.length ?? 0}
          />
          <OfferTile
            icon={Clock}
            tone="amber"
            label={t("employer.pendingOffers")}
            value={jobs?.pending.length ?? 0}
          />
          <OfferTile
            icon={Briefcase}
            tone="gray"
            label={t("employer.expiredOffers")}
            value={jobs?.expired.length ?? 0}
          />
        </div>
      </section>

      {/* The two candidate sources */}
      <section>
        <div className="mb-4 inline-flex rounded-lg border border-gray-200 p-1">
          <TabButton active={tab === "applicants"} onClick={() => setTab("applicants")}>
            {t("employer.applicants")}
            <Count>{people?.applicants.length ?? 0}</Count>
          </TabButton>
          <TabButton active={tab === "saved"} onClick={() => setTab("saved")}>
            {t("employer.savedProfiles")}
            <Count>{people?.saved.length ?? 0}</Count>
          </TabButton>
        </div>

        {tab === "saved" && (
          <p className="mb-4 text-sm text-gray-500">{t("employer.savedProfilesHint")}</p>
        )}

        {statusError && tab === "applicants" && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{statusError}</p>
        )}

        {list === undefined || list === null ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            title={tab === "saved" ? t("employer.noSavedProfiles") : t("employer.noApplicants")}
            action={
              <Link
                href="/jobProfile"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white"
              >
                {t("employer.findBestProfiles")}
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {list.map((row) => {
              const c = row.candidate;
              if (!c) return null;
              const status = row.status ? APPLICATION_STATUS[row.status] : null;
              const city = getCity(c.city);

              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.photo} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{c.name}</p>
                      <p className="truncate text-sm text-gray-500">
                        {pick(c, "title")} · {pick(city)}
                      </p>
                      {row.jobTitle && (
                        <p className="truncate text-xs text-gray-400">{row.jobTitle}</p>
                      )}
                      {row.note && <p className="truncate text-xs text-gray-400">{row.note}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {status && (
                      <div className="flex flex-col items-end gap-1">
                        <Select
                          options={STATUS_OPTIONS}
                          value={row.status}
                          disabled={updatingId === row.id}
                          onChange={(e) => handleStatusChange(row.id, e.target.value)}
                          className={`w-auto min-w-[9.5rem] py-1.5 text-xs font-semibold ${TONES[status.tone]}`}
                          aria-label={t("profile.currentStatus")}
                        />
                        {updatingId === row.id && (
                          <span className="text-[11px] text-gray-400">{t("common.loading")}</span>
                        )}
                      </div>
                    )}
                    <Link
                      href={`/jobProfile/${c.id}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      {t("common.seeProfile")}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

const TILE_TONES = {
  brand: "bg-brand-soft text-brand",
  amber: "bg-amber-50 text-amber-600",
  gray: "bg-gray-100 text-gray-500",
};

function OfferTile({ icon: Icon, tone, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${TILE_TONES[tone]}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
        active ? "bg-brand text-white" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ children }) {
  return (
    <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] font-semibold">
      {children}
    </span>
  );
}
