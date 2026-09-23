"use client";

// CV database — ClientDoc section 14.
//
// Filters: name, city, job title, sub-job, experience, availability, expected
// salary, contract type, languages, skills, education, registration date, last
// login, profile completion, verified, available.
//
// Actions: view, edit, verify, deactivate, delete, restore, add skill, correct
// information, view history, view applications, see which employers requested
// the candidate's contact details, approve or remove photos.
//
// "Admin must be able to export the full candidate CV database to Excel with
//  all filters" — the export writes exactly the filtered rows, not everything.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search, BadgeCheck } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { CANDIDATES } from "@/mock/candidates";
import { CITIES, getCity } from "@/mock/cities";
import { SECTORS, getPositions, POSITIONS } from "@/mock/sectors";
import { EXPERIENCE_LEVELS, AVAILABILITY, CONTRACT_TYPES, REQUIREMENT_BY_ID } from "@/mock/jobOptions";
import { ACTIVITY_LOG } from "@/mock/admin";
import { FilterSelect, Input } from "@/app/component/ui/Fields";
import { downloadCsv } from "@/lib/exportCsv";
import {
  PageHeader, Table, Td, EmptyRow, Badge, RowActions,
} from "@/app/component/admin/AdminUI";

const INITIAL = {
  q: "",
  city: "all",
  sectorId: "all",
  positionId: "all",
  experience: "all",
  availability: "all",
  contractType: "all",
  verified: "all",
  completion: "all",
};

const VERIFIED_OPTIONS = [
  { id: "yes", fr: "Vérifiés", ar: "متحقّق منهم" },
  { id: "no", fr: "Non vérifiés", ar: "ماشي متحقّق منهم" },
];

const COMPLETION_OPTIONS = [
  { id: "100", fr: "100%", ar: "100%" },
  { id: "partial", fr: "Incomplets", ar: "ماشي كاملين" },
];

export default function AdminCandidatesPage() {
  const t = useT();
  const { pick } = useLocale();

  const [filters, setFilters] = useState(INITIAL);
  // Local overrides so the demo actions visibly change a row.
  const [overrides, setOverrides] = useState({});

  const positions = useMemo(
    () => (filters.sectorId === "all" ? [] : getPositions(filters.sectorId)),
    [filters.sectorId]
  );

  const set = (key, value) =>
    setFilters((f) =>
      key === "sectorId" ? { ...f, sectorId: value, positionId: "all" } : { ...f, [key]: value }
    );

  const rows = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    return CANDIDATES.map((c) => ({ ...c, ...overrides[c.id] })).filter((c) => {
      if (c.deleted) return false;
      if (term && !`${c.name} ${c.title} ${c.email}`.toLowerCase().includes(term)) return false;
      if (filters.city !== "all" && c.city !== filters.city) return false;
      if (filters.sectorId !== "all" && c.sectorId !== filters.sectorId) return false;
      if (filters.positionId !== "all" && c.positionId !== filters.positionId) return false;
      if (filters.experience !== "all" && c.experience !== filters.experience) return false;
      if (filters.availability !== "all" && c.availability !== filters.availability) return false;
      if (filters.contractType !== "all" && c.contractType !== filters.contractType) return false;
      if (filters.verified !== "all" && c.verified !== (filters.verified === "yes")) return false;
      if (filters.completion === "100" && c.completion !== 100) return false;
      if (filters.completion === "partial" && c.completion === 100) return false;
      return true;
    });
  }, [filters, overrides]);

  const patch = (id, changes) =>
    setOverrides((o) => ({ ...o, [id]: { ...o[id], ...changes } }));

  const exportRows = () => {
    const columns = [
      { key: "name", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Téléphone" },
      { label: "Ville", format: (r) => getCity(r.city)?.fr || r.city },
      { label: "Secteur", format: (r) => SECTORS.find((s) => s.id === r.sectorId)?.fr || "" },
      { label: "Poste", format: (r) => r.title },
      {
        label: "Expérience",
        format: (r) => EXPERIENCE_LEVELS.find((e) => e.id === r.experience)?.fr || "",
      },
      {
        label: "Disponibilité",
        format: (r) => AVAILABILITY.find((a) => a.id === r.availability)?.fr || "",
      },
      { key: "expectedSalary", label: "Salaire souhaité (MAD)" },
      {
        label: "Type de contrat",
        format: (r) => CONTRACT_TYPES.find((c) => c.id === r.contractType)?.fr || "",
      },
      {
        label: "Compétences",
        format: (r) => r.skills.map((s) => REQUIREMENT_BY_ID[s]?.fr).filter(Boolean).join(", "),
      },
      { label: "Formation", format: (r) => r.training.map((x) => `${x.diploma} (${x.school})`).join(" | ") },
      { key: "registeredAt", label: "Date d'inscription" },
      { key: "completion", label: "Complétude (%)" },
      { label: "Vérifié", format: (r) => (r.verified ? "Oui" : "Non") },
      { label: "CV", format: (r) => (r.hasCv ? "Oui" : "Non") },
    ];
    downloadCsv(`nkhedmou-cv-database-${new Date().toISOString().slice(0, 10)}`, columns, rows);
  };

  return (
    <>
      <PageHeader
        title={t("admin.candidate.title")}
        subtitle={t("admin.candidate.subtitle", { n: rows.length })}
        action={
          <button
            onClick={exportRows}
            disabled={!rows.length}
            className="flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            <Download size={16} />
            {t("admin.export")}
          </button>
        }
      />

      {/* Filters */}
      <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder={t("admin.search")}
            className="ps-9"
          />
        </div>

        <FilterSelect options={CITIES} allLabel={t("common.city")} value={filters.city} onChange={(v) => set("city", v)} />
        <FilterSelect options={SECTORS} allLabel={t("common.sector")} value={filters.sectorId} onChange={(v) => set("sectorId", v)} />
        <FilterSelect options={positions} allLabel={t("common.position")} value={filters.positionId} onChange={(v) => set("positionId", v)} />
        <FilterSelect options={EXPERIENCE_LEVELS} allLabel={t("common.experience")} value={filters.experience} onChange={(v) => set("experience", v)} />
        <FilterSelect options={AVAILABILITY} allLabel={t("common.availability")} value={filters.availability} onChange={(v) => set("availability", v)} />
        <FilterSelect options={CONTRACT_TYPES} allLabel={t("common.contractType")} value={filters.contractType} onChange={(v) => set("contractType", v)} />
        <FilterSelect options={VERIFIED_OPTIONS} allLabel={t("admin.candidate.verified")} value={filters.verified} onChange={(v) => set("verified", v)} />
        <FilterSelect options={COMPLETION_OPTIONS} allLabel={t("admin.candidate.completion")} value={filters.completion} onChange={(v) => set("completion", v)} />
      </div>

      <Table
        columns={[
          t("admin.candidate.name"),
          t("common.position"),
          t("common.city"),
          t("common.experience"),
          t("admin.candidate.completion"),
          t("admin.candidate.registered"),
          "",
        ]}
      >
        {rows.length === 0 ? (
          <EmptyRow colSpan={7} label={t("admin.noRows")} />
        ) : (
          rows.map((c) => {
            const contactRequests = ACTIVITY_LOG.filter(
              (l) => l.type === "contact-access" && l.target === c.name
            ).length;

            return (
              <tr key={c.id} className={c.deactivated ? "opacity-50" : ""}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.photo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-medium text-gray-900">
                        <span className="truncate">{c.name}</span>
                        {c.verified && <BadgeCheck size={14} className="shrink-0 text-brand" />}
                      </p>
                      <p className="truncate text-xs text-gray-500">{c.email}</p>
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-gray-700">
                  {pick(c, "title")}
                </Td>
                <Td className="whitespace-nowrap text-gray-700">{pick(getCity(c.city))}</Td>
                <Td className="whitespace-nowrap text-gray-700">
                  {pick(EXPERIENCE_LEVELS.find((e) => e.id === c.experience))}
                </Td>
                <Td>
                  <Badge tone={c.completion === 100 ? "green" : "amber"}>{c.completion}%</Badge>
                </Td>
                <Td className="whitespace-nowrap text-xs text-gray-500">{c.registeredAt}</Td>
                <Td>
                  <div className="flex justify-end">
                    <RowActions
                      actions={[
                        { label: t("admin.candidate.view"), onClick: () => window.open(`/jobProfile/${c.id}`, "_blank") },
                        { label: t("admin.candidate.edit") },
                        c.verified
                          ? { label: t("admin.candidate.unverify"), onClick: () => patch(c.id, { verified: false }) }
                          : { label: t("admin.candidate.verify"), onClick: () => patch(c.id, { verified: true }) },
                        c.deactivated
                          ? { label: t("admin.candidate.activate"), onClick: () => patch(c.id, { deactivated: false }) }
                          : { label: t("admin.candidate.deactivate"), onClick: () => patch(c.id, { deactivated: true }) },
                        { label: t("admin.candidate.addSkill") },
                        { label: t("admin.candidate.history") },
                        { label: t("admin.candidate.applications") },
                        {
                          label: `${t("admin.candidate.contactRequests")} (${contactRequests})`,
                        },
                        { label: t("admin.candidate.delete"), tone: "danger", onClick: () => patch(c.id, { deleted: true }) },
                      ]}
                    />
                  </div>
                </Td>
              </tr>
            );
          })
        )}
      </Table>

      <p className="mt-4 text-xs text-gray-500">
        <Link href="/admin/activity" className="text-accent hover:underline">
          {t("admin.activityPage.title")}
        </Link>{" "}
        — {t("admin.activityPage.subtitle")}
      </p>
    </>
  );
}
