"use client";

// Saved Profiles + applicants.
//
// Change Requirements section 10:
//   "Employers can see two types of candidates: (1) candidates who applied to
//    their offer, and (2) candidates the employer manually saved while browsing
//    profiles."
//
// Both lists live here, reusing the same CandidateCard as the search page so a
// saved profile behaves identically wherever it appears.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Users, Search } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { fetchEmployerCandidates } from "@/mock/api";
import CandidateCard from "@/app/component/allJobs/CandidateCard";
import EmptyState, { CardSkeleton } from "@/app/component/ui/EmptyState";

export default function SavedProfilesPage() {
  const t = useT();
  const [people, setPeople] = useState(null);
  const [tab, setTab] = useState("saved");

  useEffect(() => {
    fetchEmployerCandidates().then(setPeople);
  }, []);

  const list = tab === "saved" ? people?.saved : people?.applicants;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-poppins">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("employer.savedProfiles")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{t("employer.savedProfilesHint")}</p>
      </header>

      <div className="mb-6 inline-flex rounded-lg border border-gray-200 p-1">
        <TabButton active={tab === "saved"} onClick={() => setTab("saved")} icon={Bookmark}>
          {t("employer.savedProfiles")}
          <Count>{people?.saved.length ?? 0}</Count>
        </TabButton>
        <TabButton active={tab === "applicants"} onClick={() => setTab("applicants")} icon={Users}>
          {t("employer.applicants")}
          <Count>{people?.applicants.length ?? 0}</Count>
        </TabButton>
      </div>

      {!people ? (
        <CardSkeleton count={6} />
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === "saved" ? t("employer.noSavedProfiles") : t("employer.noApplicants")}
          body={t("employer.savedProfilesHint")}
          action={
            <Link
              href="/jobProfile"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Search size={15} />
              {t("employer.findBestProfiles")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((row) =>
            row.candidate ? (
              <CandidateCard
                key={row.id}
                candidate={row.candidate}
                initiallySaved={tab === "saved"}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
        active ? "bg-brand text-white" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <Icon size={15} />
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
