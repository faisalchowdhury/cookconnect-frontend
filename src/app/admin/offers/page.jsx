"use client";

// Offer management — ClientDoc section 15.
//
// Filters: active, pending approval, expired, closed, rejected.
// Actions on each offer: Edit, Approve, Reject, Deactivate, Extend
// exceptionally, Republish, Delete.
//
// Change Requirements 08: approved offers are clearly marked in green, and the
// pending-approval queue is the default view so moderation is the first thing
// an admin sees.

import { useMemo, useState } from "react";
import { Search, Clock, CheckCircle2, Archive, AlertTriangle, XCircle } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { JOBS, daysLeft, isExpired } from "@/mock/jobs";
import { getCity } from "@/mock/cities";
import { REPORTED_OFFERS } from "@/mock/admin";
import { Input } from "@/app/component/ui/Fields";
import { PageHeader, Table, Td, EmptyRow, Badge, RowActions } from "@/app/component/admin/AdminUI";

const TABS = [
  { id: "pending", labelKey: "admin.offer.pendingQueue", icon: Clock },
  { id: "active", labelKey: "employer.activeOffers", icon: CheckCircle2 },
  { id: "expired", labelKey: "employer.expiredOffers", icon: Archive },
  { id: "rejected", labelKey: "admin.offer.rejected", icon: XCircle },
  { id: "reported", labelKey: "admin.offer.reported", icon: AlertTriangle },
  { id: "all", labelKey: "admin.offer.allOffers", icon: null },
];

const REPORTED_IDS = new Set(REPORTED_OFFERS.map((r) => r.jobId));

export default function AdminOffersPage() {
  const t = useT();
  const { pick } = useLocale();

  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");
  const [overrides, setOverrides] = useState({});

  const patch = (id, changes) => setOverrides((o) => ({ ...o, [id]: { ...o[id], ...changes } }));

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return JOBS.map((j) => {
      const o = overrides[j.id] || {};
      const status = o.status ?? j.status;
      return { ...j, ...o, status, expired: isExpired(j), daysLeft: daysLeft(j) };
    })
      .filter((j) => !j.deleted)
      .filter((j) => {
        if (term && !`${j.title} ${j.employerName}`.toLowerCase().includes(term)) return false;
        switch (tab) {
          case "pending":
            return j.status === "pending";
          case "active":
            return j.status === "active" && !j.expired;
          case "expired":
            return j.expired || j.status === "expired";
          case "rejected":
            return j.status === "rejected";
          case "reported":
            return REPORTED_IDS.has(j.id);
          default:
            return true;
        }
      });
  }, [tab, q, overrides]);

  const countFor = (id) =>
    JOBS.map((j) => {
      const o = overrides[j.id] || {};
      return { ...j, ...o, status: o.status ?? j.status, expired: isExpired(j) };
    })
      .filter((j) => !j.deleted)
      .filter((j) => {
        switch (id) {
          case "pending": return j.status === "pending";
          case "active": return j.status === "active" && !j.expired;
          case "expired": return j.expired || j.status === "expired";
          case "rejected": return j.status === "rejected";
          case "reported": return REPORTED_IDS.has(j.id);
          default: return true;
        }
      }).length;

  return (
    <>
      <PageHeader
        title={t("admin.offer.title")}
        subtitle={t("admin.offer.subtitle", { n: JOBS.length })}
      />

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {TABS.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === id ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {Icon && <Icon size={15} />}
            {t(labelKey)}
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] font-semibold">
              {countFor(id)}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.search")} className="ps-9" />
        </div>
      </div>

      <Table
        columns={[
          t("employer.jobTitle"),
          t("admin.offer.employer"),
          t("common.city"),
          t("admin.offer.posted"),
          t("admin.offer.expires"),
          t("jobs.applicants", { n: "" }).trim(),
          "",
          "",
        ]}
      >
        {rows.length === 0 ? (
          <EmptyRow colSpan={8} label={t("admin.noRows")} />
        ) : (
          rows.map((j) => (
            <tr key={j.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={j.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                  <p className="min-w-0 truncate font-medium text-gray-900">
                    {pick(j, "title")}
                  </p>
                </div>
              </Td>
              <Td className="whitespace-nowrap text-gray-700">{j.employerName}</Td>
              <Td className="whitespace-nowrap text-gray-700">{pick(getCity(j.city))}</Td>
              <Td className="whitespace-nowrap text-xs text-gray-500">{j.postedAt}</Td>
              <Td className="whitespace-nowrap text-xs text-gray-500">{j.expiresAt}</Td>
              <Td className="text-gray-700">{j.applicants}</Td>
              <Td>
                <StatusBadge job={j} t={t} />
              </Td>
              <Td>
                <div className="flex justify-end">
                  <RowActions
                    actions={[
                      { label: t("common.seeOffer"), onClick: () => window.open(`/allJobs/${j.id}`, "_blank") },
                      { label: t("employer.edit") },
                      j.status === "pending" && {
                        label: t("admin.offer.approve"),
                        onClick: () => patch(j.id, { status: "active" }),
                      },
                      j.status === "pending" && {
                        label: t("admin.offer.reject"),
                        tone: "danger",
                        onClick: () => patch(j.id, { status: "rejected" }),
                      },
                      j.status === "active" && {
                        label: t("admin.offer.deactivate"),
                        onClick: () => patch(j.id, { status: "rejected" }),
                      },
                      { label: t("admin.offer.extend") },
                      (j.expired || j.status === "expired") && {
                        label: t("admin.offer.republish"),
                        onClick: () => patch(j.id, { status: "pending" }),
                      },
                      { label: t("admin.offer.delete"), tone: "danger", onClick: () => patch(j.id, { deleted: true }) },
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

function StatusBadge({ job, t }) {
  if (job.status === "rejected") return <Badge tone="red">{t("admin.offer.rejected")}</Badge>;
  if (job.status === "pending") return <Badge tone="amber">{t("employer.pending")}</Badge>;
  if (job.expired || job.status === "expired") return <Badge tone="gray">{t("jobs.expired")}</Badge>;
  // Approved offers are green, per Change Requirements 08.
  return <Badge tone="green">{t("admin.offer.approved")}</Badge>;
}
