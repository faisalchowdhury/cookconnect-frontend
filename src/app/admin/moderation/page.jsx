"use client";

// Photo moderation — ClientDoc section 16:
//
//   "The admin must be able to approve or remove inappropriate photos. If a user
//    uploads abusive or inappropriate photos, the admin must be able to block
//    the user."
//
// Photos carrying reports are surfaced first, since those are the ones that
// need a decision soonest.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, Ban, AlertTriangle, ImageIcon } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { PENDING_PHOTOS, REPORTED_OFFERS } from "@/mock/admin";
import { getCandidate } from "@/mock/candidates";
import { getJob } from "@/mock/jobs";
import { PageHeader, Section, Badge } from "@/app/component/admin/AdminUI";
import EmptyState from "@/app/component/ui/EmptyState";

export default function AdminModerationPage() {
  const t = useT();
  const [decided, setDecided] = useState({});
  const [blocked, setBlocked] = useState([]);

  // Most-reported first, then newest.
  const queue = useMemo(
    () =>
      [...PENDING_PHOTOS]
        .sort((a, b) => b.reports - a.reports || b.uploadedAt.localeCompare(a.uploadedAt))
        .filter((p) => !decided[p.id]),
    [decided]
  );

  const decide = (id, verdict) => setDecided((d) => ({ ...d, [id]: verdict }));

  return (
    <>
      <PageHeader
        title={t("admin.moderationPage.title")}
        subtitle={t("admin.moderationPage.subtitle", { n: queue.length })}
      />

      {queue.length === 0 ? (
        <EmptyState icon={ImageIcon} title={t("admin.moderationPage.empty")} />
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queue.map((photo) => {
            const candidate = getCandidate(photo.candidateId);
            const isBlocked = blocked.includes(photo.candidateId);

            return (
              <div key={photo.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="relative aspect-[4/3] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  <span className="absolute start-2 top-2">
                    <Badge tone={photo.type === "food" ? "blue" : "gray"}>
                      {photo.type === "food"
                        ? t("admin.moderationPage.foodPhoto")
                        : t("admin.moderationPage.profilePhoto")}
                    </Badge>
                  </span>
                  {photo.reports > 0 && (
                    <span className="absolute end-2 top-2">
                      <Badge tone="red">
                        {t("admin.moderationPage.reports", { n: photo.reports })}
                      </Badge>
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <Link
                    href={`/jobProfile/${photo.candidateId}`}
                    className="text-sm font-medium text-gray-900 hover:text-accent"
                  >
                    {candidate?.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">{photo.uploadedAt}</p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => decide(photo.id, "approved")}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                    >
                      <Check size={15} />
                      {t("admin.moderationPage.approve")}
                    </button>
                    <button
                      onClick={() => decide(photo.id, "removed")}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <X size={15} />
                      {t("admin.moderationPage.remove")}
                    </button>
                  </div>

                  {/* Escalation for repeat offenders. */}
                  <button
                    onClick={() =>
                      setBlocked((b) =>
                        b.includes(photo.candidateId)
                          ? b.filter((x) => x !== photo.candidateId)
                          : [...b, photo.candidateId]
                      )
                    }
                    className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      isBlocked
                        ? "bg-red-600 text-white"
                        : "text-gray-500 hover:bg-gray-50 hover:text-red-600"
                    }`}
                  >
                    <Ban size={13} />
                    {t("admin.moderationPage.blockUser")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reported offers */}
      <Section title={t("admin.moderationPage.reportedOffers")}>
        {REPORTED_OFFERS.length === 0 ? (
          <p className="text-sm text-gray-400">{t("admin.noRows")}</p>
        ) : (
          <ul className="space-y-3">
            {REPORTED_OFFERS.map((r) => {
              const job = getJob(r.jobId);
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{job?.title}</p>
                      <p className="text-sm text-gray-600">
                        {job?.employerName} — {r.reason}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{r.reportedAt}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone="red">{t("admin.moderationPage.reports", { n: r.reports })}</Badge>
                    <Link
                      href="/admin/offers"
                      className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {t("common.seeOffer")}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}
