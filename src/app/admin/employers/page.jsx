"use client";

// Employer management — ClientDoc section 15.
//
// "Check how many candidate contacts each employer has requested and whether the
//  employer is actively posting job offers" — the contact-requests column sits
//  next to the offers columns so an employer harvesting contacts without ever
//  publishing is visible at a glance.

import { useMemo, useState } from "react";
import { Search, BadgeCheck, Download } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { employerActivity } from "@/mock/admin";
import { getCity, CITIES } from "@/mock/cities";
import { ESTABLISHMENT_TYPES } from "@/mock/jobOptions";
import { FilterSelect, Input } from "@/app/component/ui/Fields";
import { downloadCsv } from "@/lib/exportCsv";
import { PageHeader, Table, Td, EmptyRow, Badge, RowActions } from "@/app/component/admin/AdminUI";

const STATUS_OPTIONS = [
  { id: "verified", fr: "Vérifiés", ar: "متحقّق منهم" },
  { id: "pending", fr: "En attente", ar: "فالانتظار" },
  { id: "blocked", fr: "Bloqués", ar: "مبلوكيين" },
];

export default function AdminEmployersPage() {
  const t = useT();
  const { pick } = useLocale();

  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [overrides, setOverrides] = useState({});

  const all = useMemo(() => employerActivity(), []);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .map((e) => ({ ...e, ...overrides[e.id] }))
      .filter((e) => {
        if (term && !`${e.name} ${e.email}`.toLowerCase().includes(term)) return false;
        if (city !== "all" && e.city !== city) return false;
        if (type !== "all" && e.type !== type) return false;
        if (status === "verified" && !e.verified) return false;
        if (status === "pending" && (e.verified || e.blocked)) return false;
        if (status === "blocked" && !e.blocked) return false;
        return true;
      });
  }, [all, q, city, type, status, overrides]);

  const patch = (id, changes) => setOverrides((o) => ({ ...o, [id]: { ...o[id], ...changes } }));

  const exportRows = () =>
    downloadCsv(
      `nkhedmou-employeurs-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "name", label: "Établissement" },
        { label: "Type", format: (r) => ESTABLISHMENT_TYPES.find((x) => x.id === r.type)?.fr || r.type },
        { label: "Ville", format: (r) => getCity(r.city)?.fr || r.city },
        { key: "email", label: "Email" },
        { key: "phone", label: "Téléphone" },
        { label: "Téléphone visible", format: (r) => (r.phonePublic ? "Oui" : "Non") },
        { key: "offersPublished", label: "Offres publiées" },
        { key: "offersActive", label: "Offres actives" },
        { key: "applicationsReceived", label: "Candidatures reçues" },
        { key: "profilesViewed", label: "Profils consultés" },
        { key: "contactRequests", label: "Demandes de coordonnées" },
        { label: "Vérifié", format: (r) => (r.verified ? "Oui" : "Non") },
        { key: "lastActivity", label: "Dernière activité" },
      ],
      rows
    );

  return (
    <>
      <PageHeader
        title={t("admin.employer.title")}
        subtitle={t("admin.employer.subtitle", { n: rows.length })}
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

      <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.search")} className="ps-9" />
        </div>
        <FilterSelect options={CITIES} allLabel={t("common.city")} value={city} onChange={setCity} />
        <FilterSelect options={ESTABLISHMENT_TYPES} allLabel={t("common.establishmentType")} value={type} onChange={setType} />
        <FilterSelect options={STATUS_OPTIONS} allLabel={t("common.all")} value={status} onChange={setStatus} />
      </div>

      <Table
        columns={[
          t("profile.establishment"),
          t("common.city"),
          t("admin.employer.offersPublished"),
          t("admin.employer.offersActive"),
          t("admin.employer.applicationsReceived"),
          t("admin.employer.profilesViewed"),
          t("admin.employer.contactRequests"),
          t("admin.employer.lastActivity"),
          "",
        ]}
      >
        {rows.length === 0 ? (
          <EmptyRow colSpan={9} label={t("admin.noRows")} />
        ) : (
          rows.map((e) => (
            <tr key={e.id} className={e.blocked ? "opacity-50" : ""}>
              <Td>
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 font-medium text-gray-900">
                      <span className="truncate">{e.name}</span>
                      {e.verified && <BadgeCheck size={14} className="shrink-0 text-brand" />}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {pick(ESTABLISHMENT_TYPES.find((x) => x.id === e.type))}
                    </p>
                  </div>
                </div>
              </Td>
              <Td className="whitespace-nowrap text-gray-700">{pick(getCity(e.city))}</Td>
              <Td className="text-gray-700">{e.offersPublished}</Td>
              <Td>
                <Badge tone={e.offersActive > 0 ? "green" : "gray"}>{e.offersActive}</Badge>
              </Td>
              <Td className="text-gray-700">{e.applicationsReceived}</Td>
              <Td className="text-gray-700">{e.profilesViewed}</Td>
              <Td>
                {/* Flagged when an employer requests contacts but posts nothing. */}
                <Badge tone={e.contactRequests > 0 && e.offersActive === 0 ? "red" : "gray"}>
                  {e.contactRequests}
                </Badge>
              </Td>
              <Td className="whitespace-nowrap text-xs text-gray-500">{e.lastActivity}</Td>
              <Td>
                <div className="flex justify-end">
                  <RowActions
                    actions={[
                      { label: t("admin.candidate.view"), onClick: () => window.open("/resturentProfile", "_blank") },
                      { label: t("admin.candidate.edit") },
                      !e.verified && { label: t("admin.employer.verify"), onClick: () => patch(e.id, { verified: true }) },
                      e.blocked
                        ? { label: t("admin.employer.unblock"), onClick: () => patch(e.id, { blocked: false }) }
                        : { label: t("admin.employer.block"), tone: "danger", onClick: () => patch(e.id, { blocked: true }) },
                    ]}
                  />
                </div>
              </Td>
            </tr>
          ))
        )}
      </Table>
    </>
  );
}
