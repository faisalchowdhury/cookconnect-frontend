"use client";

// Activity log — ClientDoc section 20:
//
//   "The platform should keep an activity/history log for important
//    administrative actions and access to candidate contact information."
//
// Employer access to candidate contact details is the entry type that matters
// most for the privacy rules, so it is filterable on its own.

import { useMemo, useState } from "react";
import { ShieldCheck, Eye, ImageIcon, Download } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { ACTIVITY_LOG } from "@/mock/admin";
import { downloadCsv } from "@/lib/exportCsv";
import { PageHeader, Table, Td, EmptyRow, Badge } from "@/app/component/admin/AdminUI";

const TABS = [
  { id: "all", labelKey: "admin.activityPage.all", icon: null },
  { id: "admin", labelKey: "admin.activityPage.adminActions", icon: ShieldCheck },
  { id: "contact-access", labelKey: "admin.activityPage.contactAccess", icon: Eye },
  { id: "photo", labelKey: "admin.activityPage.photoUploads", icon: ImageIcon },
];

const TYPE_TONE = { admin: "blue", "contact-access": "amber", photo: "gray" };

export default function AdminActivityPage() {
  const t = useT();
  const { pick } = useLocale();
  const [tab, setTab] = useState("all");

  const rows = useMemo(
    () => (tab === "all" ? ACTIVITY_LOG : ACTIVITY_LOG.filter((l) => l.type === tab)),
    [tab]
  );

  const label = (type) =>
    ({
      admin: t("admin.activityPage.adminActions"),
      "contact-access": t("admin.activityPage.contactAccess"),
      photo: t("admin.activityPage.photoUploads"),
    })[type] || type;

  const exportRows = () =>
    downloadCsv(
      `nkhedmou-journal-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "at", label: "Date" },
        { label: "Type", format: (r) => label(r.type) },
        { key: "actor", label: "Auteur" },
        { key: "target", label: "Cible" },
        { key: "detail", label: "Détail" },
      ],
      rows
    );

  return (
    <>
      <PageHeader
        title={t("admin.activityPage.title")}
        subtitle={t("admin.activityPage.subtitle")}
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
              {id === "all" ? ACTIVITY_LOG.length : ACTIVITY_LOG.filter((l) => l.type === id).length}
            </span>
          </button>
        ))}
      </div>

      <Table
        columns={[
          t("admin.activityPage.when"),
          "Type",
          t("admin.activityPage.actor"),
          t("admin.activityPage.target"),
          t("admin.activityPage.detail"),
        ]}
      >
        {rows.length === 0 ? (
          <EmptyRow colSpan={5} label={t("admin.noRows")} />
        ) : (
          rows.map((l) => (
            <tr key={l.id}>
              <Td className="whitespace-nowrap text-xs text-gray-500">{l.at}</Td>
              <Td>
                <Badge tone={TYPE_TONE[l.type]}>{label(l.type)}</Badge>
              </Td>
              <Td className="whitespace-nowrap font-medium text-gray-900">{pick(l, "actor")}</Td>
              <Td className="whitespace-nowrap text-gray-700">{l.target}</Td>
              <Td className="text-gray-600">{pick(l, "detail")}</Td>
            </tr>
          ))
        )}
      </Table>
    </>
  );
}
