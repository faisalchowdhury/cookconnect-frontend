"use client";

// "Find Profiles" — the employer-facing candidate search.
//
// ClientDoc section 6: candidate profile search filters are city, sector, job
// and experience. Change Requirements 07: 12 profiles per page, plus the same
// "Search All" shortcut as the offers page. Section 03: guests see page 1 only.

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, RotateCcw, Zap } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { fetchSavedProfileIds, searchCandidates, USE_API } from "@/mock/api";
import { useTaxonomyVersion } from "@/components/TaxonomyHydrator";
import { SECTORS, getPositions } from "@/mock/sectors";
import { CITIES, COUNTRY } from "@/mock/cities";
import { EXPERIENCE_LEVELS, AVAILABILITY } from "@/mock/jobOptions";
import { SAVED_PROFILES } from "@/mock/applications";
import { FilterSelect, Input } from "@/app/component/ui/Fields";
import CandidateCard from "@/app/component/allJobs/CandidateCard";
import Pagination from "@/app/component/ui/Pagination";
import EmptyState, { CardSkeleton } from "@/app/component/ui/EmptyState";

const INITIAL = {
  q: "",
  city: "all",
  sectorId: "all",
  positionId: "all",
  experience: "all",
  availability: "all",
};

const FIXTURE_SAVED_IDS = new Set(SAVED_PROFILES.map((s) => s.candidateId));
const DEFAULT_SAVED_IDS = USE_API ? new Set() : FIXTURE_SAVED_IDS;

export default function FindProfilesPage() {
  const t = useT();
  const { user, isLoggedIn } = useSession();
  const taxonomyVersion = useTaxonomyVersion();

  const [filters, setFilters] = useState(INITIAL);
  const [page, setPage] = useState(1);
  const [searchAll, setSearchAll] = useState(false);
  const [response, setResponse] = useState({ key: null, data: null });
  const [showFilters, setShowFilters] = useState(false);
  // Saved ids are tagged with the account they were fetched for, so signing out
  // falls back to the default set without resetting state inside an effect.
  const savedKey = isLoggedIn ? user?.id || "signed-in" : null;
  const [savedProfiles, setSavedProfiles] = useState({ key: null, ids: DEFAULT_SAVED_IDS });
  const savedIds = savedProfiles.key === savedKey ? savedProfiles.ids : DEFAULT_SAVED_IDS;

  useEffect(() => {
    if (!savedKey) return undefined;
    let alive = true;
    fetchSavedProfileIds().then((ids) => {
      if (alive) setSavedProfiles({ key: savedKey, ids });
    });
    return () => {
      alive = false;
    };
  }, [savedKey]);

  const positions = useMemo(
    () => (filters.sectorId === "all" ? [] : getPositions(filters.sectorId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positions live in module-level lists the API hydrates; the version forces a re-read
    [filters.sectorId, taxonomyVersion]
  );

  // Same request-key pattern as the offers page: state is written only from the
  // async continuation, and out-of-order responses are discarded.
  const queryKey = JSON.stringify({ ...filters, page, isLoggedIn, searchAll });

  useEffect(() => {
    let alive = true;
    searchCandidates(JSON.parse(queryKey)).then((data) => {
      if (alive) setResponse({ key: queryKey, data });
    });
    return () => {
      alive = false;
    };
  }, [queryKey]);

  const result = response.key === queryKey ? response.data : null;

  const setFilter = (key, value) => {
    setPage(1);
    setSearchAll(false);
    setFilters((f) =>
      key === "sectorId" ? { ...f, sectorId: value, positionId: "all" } : { ...f, [key]: value }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-poppins">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("candidates.title")}</h1>
        {result && (
          <p className="mt-1 text-sm text-gray-600">
            {t("candidates.subtitle", { n: result.total })}
          </p>
        )}
      </header>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={filters.q}
            onChange={(e) => setFilter("q", e.target.value)}
            placeholder={t("candidates.searchPlaceholder")}
            className="ps-10"
          />
        </div>

        <button
          onClick={() => {
            setFilters(INITIAL);
            setSearchAll(true);
            setPage(1);
          }}
          title={t("jobs.searchAllHint")}
          className="flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <Zap size={16} />
          {t("common.searchAll")}
        </button>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 lg:hidden"
        >
          <SlidersHorizontal size={16} />
          {t("common.filters")}
        </button>
      </div>

      <div
        className={`mb-8 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 ${
          showFilters ? "grid" : "hidden lg:grid"
        }`}
      >
        <Cell label={t("common.country")}>
          <Input value={COUNTRY.fr} disabled readOnly />
        </Cell>

        <Cell label={t("common.city")}>
          <FilterSelect
            options={CITIES}
            allLabel={t("common.all")}
            value={filters.city}
            onChange={(v) => setFilter("city", v)}
          />
        </Cell>

        <Cell label={t("common.sector")}>
          <FilterSelect
            options={SECTORS}
            allLabel={t("common.all")}
            value={filters.sectorId}
            onChange={(v) => setFilter("sectorId", v)}
          />
        </Cell>

        <Cell
          label={t("common.position")}
          hint={filters.sectorId === "all" ? t("common.selectFirst") : undefined}
        >
          <FilterSelect
            options={positions}
            allLabel={t("common.all")}
            value={filters.positionId}
            onChange={(v) => setFilter("positionId", v)}
          />
        </Cell>

        <Cell label={t("common.experience")}>
          <FilterSelect
            options={EXPERIENCE_LEVELS}
            allLabel={t("common.all")}
            value={filters.experience}
            onChange={(v) => setFilter("experience", v)}
          />
        </Cell>

        <Cell label={t("common.availability")}>
          <FilterSelect
            options={AVAILABILITY}
            allLabel={t("common.all")}
            value={filters.availability}
            onChange={(v) => setFilter("availability", v)}
          />
        </Cell>

        <div className="flex items-end lg:col-span-2">
          <button
            onClick={() => {
              setFilters(INITIAL);
              setSearchAll(false);
              setPage(1);
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCcw size={15} />
            {t("common.reset")}
          </button>
        </div>
      </div>

      {result === null ? (
        <CardSkeleton count={6} />
      ) : result.items.length === 0 ? (
        <EmptyState title={t("common.noResults")} body={t("common.noResultsHint")} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                initiallySaved={savedIds.has(candidate.id)}
              />
            ))}
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            visiblePages={result.visiblePages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function Cell({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">
        {label}
        {hint && <span className="ms-1 text-gray-400">({hint})</span>}
      </span>
      {children}
    </label>
  );
}
