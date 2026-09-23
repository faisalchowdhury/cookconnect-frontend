"use client";

// Job offers listing.
//
// Change Requirements section 07:
//  - "Direct Search Button": a "Search All" button that queries the full
//    database without requiring any filter to be set first.
//  - Filters: job type (long/short term), city, establishment type, job title.
//  - "Country Lock": Morocco is fixed; only city-level filtering.
//  - "Pagination": 12 per page.
//
// Section 03 adds the guest rule: a signed-out visitor only reaches page 1.

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, RotateCcw, Zap } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { searchJobs, fetchBookmarkJobIds } from "@/mock/api";
import { useTaxonomyVersion } from "@/components/TaxonomyHydrator";
import { SECTORS, getPositions } from "@/mock/sectors";
import { CITIES, COUNTRY } from "@/mock/cities";
import { CONTRACT_TYPES, ESTABLISHMENT_TYPES, EXPERIENCE_LEVELS } from "@/mock/jobOptions";
import { FilterSelect, Input } from "@/app/component/ui/Fields";
import JobCard from "@/app/component/allJobs/JobCard";
import Pagination from "@/app/component/ui/Pagination";
import EmptyState, { CardSkeleton } from "@/app/component/ui/EmptyState";

const INITIAL = {
  q: "",
  city: "all",
  sectorId: "all",
  positionId: "all",
  contractType: "all",
  establishmentType: "all",
  experience: "all",
};

const NO_SAVED_IDS = new Set();

export default function AllJobsPage() {
  const t = useT();
  const { user, isLoggedIn, isCandidate } = useSession();
  const taxonomyVersion = useTaxonomyVersion();

  const [filters, setFilters] = useState(INITIAL);
  const [page, setPage] = useState(1);
  const [searchAll, setSearchAll] = useState(false);
  const [response, setResponse] = useState({ key: null, data: null });
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState({ key: null, ids: NO_SAVED_IDS });

  const positions = useMemo(
    () => (filters.sectorId === "all" ? [] : getPositions(filters.sectorId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positions live in module-level lists the API hydrates; the version forces a re-read
    [filters.sectorId, taxonomyVersion]
  );

  // The query is identified by a key. State is only written from the async
  // continuation — never synchronously inside the effect body — and a response
  // whose key no longer matches the current query is discarded, so a slow
  // earlier request can't overwrite a newer one.
  const queryKey = JSON.stringify({ ...filters, page, isLoggedIn, searchAll });

  useEffect(() => {
    let alive = true;
    const query = JSON.parse(queryKey);
    searchJobs(query).then((data) => {
      if (alive) setResponse({ key: queryKey, data });
    });
    return () => {
      alive = false;
    };
  }, [queryKey]);

  // Saved ids are tagged with the account they were fetched for, so signing out
  // shows none immediately without resetting state inside an effect.
  const savedKey = isLoggedIn && isCandidate ? user?.id || "candidate" : null;
  const savedIds = bookmarks.key === savedKey ? bookmarks.ids : NO_SAVED_IDS;

  useEffect(() => {
    if (!savedKey) return undefined;
    let alive = true;
    fetchBookmarkJobIds()
      .then((ids) => {
        if (alive) setBookmarks({ key: savedKey, ids });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [savedKey]);

  // While a new query is in flight the previous response is ignored, which is
  // what drives the skeleton.
  const result = response.key === queryKey ? response.data : null;

  const setFilter = (key, value) => {
    setPage(1);
    setSearchAll(false);
    // Sector drives the position list, so clear the position when it changes.
    setFilters((f) =>
      key === "sectorId" ? { ...f, sectorId: value, positionId: "all" } : { ...f, [key]: value }
    );
  };

  const reset = () => {
    setFilters(INITIAL);
    setSearchAll(false);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-poppins">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("jobs.title")}</h1>
        {result && (
          <p className="mt-1 text-sm text-gray-600">{t("jobs.subtitle", { n: result.total })}</p>
        )}
      </header>

      {/* Search bar */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={filters.q}
            onChange={(e) => setFilter("q", e.target.value)}
            placeholder={t("jobs.searchPlaceholder")}
            className="ps-10"
          />
        </div>

        {/* Search All — ignores every filter, per Change Req 07. */}
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

      {/* Filters */}
      <div
        className={`mb-8 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 ${
          showFilters ? "grid" : "hidden lg:grid"
        }`}
      >
        {/* Country is locked while Morocco is the only market. */}
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">{t("common.country")}</span>
          <Input value={COUNTRY.fr} disabled readOnly />
        </label>

        <FilterCell label={t("common.city")}>
          <FilterSelect
            options={CITIES}
            allLabel={t("common.all")}
            value={filters.city}
            onChange={(v) => setFilter("city", v)}
          />
        </FilterCell>

        <FilterCell label={t("common.establishmentType")}>
          <FilterSelect
            options={ESTABLISHMENT_TYPES}
            allLabel={t("common.all")}
            value={filters.establishmentType}
            onChange={(v) => setFilter("establishmentType", v)}
          />
        </FilterCell>

        <FilterCell label={t("common.contractType")}>
          <FilterSelect
            options={CONTRACT_TYPES}
            allLabel={t("common.all")}
            value={filters.contractType}
            onChange={(v) => setFilter("contractType", v)}
          />
        </FilterCell>

        <FilterCell label={t("common.sector")}>
          <FilterSelect
            options={SECTORS}
            allLabel={t("common.all")}
            value={filters.sectorId}
            onChange={(v) => setFilter("sectorId", v)}
          />
        </FilterCell>

        <FilterCell
          label={t("common.position")}
          hint={filters.sectorId === "all" ? t("common.selectFirst") : undefined}
        >
          <FilterSelect
            options={positions}
            allLabel={t("common.all")}
            value={filters.positionId}
            onChange={(v) => setFilter("positionId", v)}
          />
        </FilterCell>

        <FilterCell label={t("common.experience")}>
          <FilterSelect
            options={EXPERIENCE_LEVELS}
            allLabel={t("common.all")}
            value={filters.experience}
            onChange={(v) => setFilter("experience", v)}
          />
        </FilterCell>

        <div className="flex items-end">
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCcw size={15} />
            {t("common.reset")}
          </button>
        </div>
      </div>

      {/* Results */}
      {result === null ? (
        <CardSkeleton count={6} />
      ) : result.items.length === 0 ? (
        <EmptyState title={t("common.noResults")} body={t("common.noResultsHint")} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((job) => (
              <JobCard key={job.id} job={job} initiallySaved={savedIds.has(job.id)} />
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

function FilterCell({ label, hint, children }) {
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
