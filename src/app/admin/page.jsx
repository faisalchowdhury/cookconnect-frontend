"use client";

// Admin overview — ClientDoc section 13 (candidate / employer / offer
// statistics) and section 16 (platform + market data).

import Link from "next/link";
import {
  Users, UserCheck, Building2, Briefcase, Clock, AlertTriangle, TrendingUp, Wallet,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  candidateStats, employerStats, offerStats,
  MOST_SEARCHED_TITLES, MOST_SEARCHED_CITIES, averageSalary,
} from "@/mock/admin";
import { ESTABLISHMENT_TYPES } from "@/mock/jobOptions";
import { PageHeader, Section, Stat, StatGrid, BarList, Badge } from "@/app/component/admin/AdminUI";

export default function AdminOverviewPage() {
  const t = useT();
  const { pick } = useLocale();

  const c = candidateStats();
  const e = employerStats();
  const o = offerStats();

  return (
    <>
      <PageHeader title={t("admin.overview")} />

      {/* Candidates */}
      <Section title={t("admin.stats.candidates")}>
        <StatGrid>
          <Stat icon={Users} label={t("admin.stats.total")} value={c.total} tone="brand" />
          <Stat label={t("admin.stats.newToday")} value={c.newToday} />
          <Stat label={t("admin.stats.newThisWeek")} value={c.newThisWeek} />
          <Stat label={t("admin.stats.newThisMonth")} value={c.newThisMonth} />
          <Stat label={t("admin.stats.active")} value={c.active} />
          <Stat icon={UserCheck} label={t("admin.stats.verified")} value={c.verified} tone="brand" />
          <Stat label={t("admin.stats.complete")} value={c.complete} />
          <Stat label={t("admin.stats.availableNow")} value={c.availableNow} tone="accent" />
        </StatGrid>
      </Section>

      {/* Employers */}
      <Section title={t("admin.stats.employers")}>
        <StatGrid>
          <Stat icon={Building2} label={t("admin.stats.total")} value={e.total} tone="brand" />
          <Stat label={t("admin.stats.verified")} value={e.verified} />
          <Stat label={t("admin.stats.pending")} value={e.pending} tone="amber" />
          <Stat label={t("admin.stats.blocked")} value={e.blocked} tone="red" />
          <Stat label={t("admin.stats.active")} value={e.active} />
        </StatGrid>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("admin.stats.byType")}
          </p>
          <div className="flex flex-wrap gap-2">
            {ESTABLISHMENT_TYPES.map((type) => (
              <span
                key={type.id}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
              >
                {pick(type)}{" "}
                <span className="font-semibold text-gray-900">{e.byType[type.id] || 0}</span>
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Offers */}
      <Section
        title={t("admin.stats.offers")}
        action={
          <Link href="/admin/offers" className="text-sm font-medium text-accent hover:underline">
            {t("common.seeMore")}
          </Link>
        }
      >
        <StatGrid>
          <Stat icon={Briefcase} label={t("admin.stats.activeOffers")} value={o.active} tone="brand" />
          <Stat label={t("admin.stats.postedToday")} value={o.postedToday} />
          <Stat label={t("admin.stats.postedThisMonth")} value={o.postedThisMonth} />
          <Stat icon={Clock} label={t("admin.stats.expiringSoon")} value={o.expiringSoon} tone="amber" />
          <Stat label={t("admin.stats.expired")} value={o.expired} />
          <Stat label={t("admin.stats.closed")} value={o.closed} />
          <Stat label={t("admin.stats.pendingApproval")} value={o.pendingApproval} tone="amber" />
          <Stat icon={AlertTriangle} label={t("admin.stats.reported")} value={o.reported} tone="red" />
        </StatGrid>
      </Section>

      {/* Market data */}
      <Section title={t("admin.stats.platform")}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <TrendingUp size={15} className="text-brand" />
              {t("admin.stats.topTitles")}
            </p>
            <BarList
              valueLabel={t("admin.stats.searches")}
              items={MOST_SEARCHED_TITLES.map((i) => ({ ...i, label: pick(i) }))}
            />
          </div>

          <div>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <TrendingUp size={15} className="text-brand" />
              {t("admin.stats.topCities")}
            </p>
            <BarList
              valueLabel={t("admin.stats.searches")}
              items={MOST_SEARCHED_CITIES.map((i) => ({ ...i, label: pick(i) }))}
            />
          </div>

          <div>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Wallet size={15} className="text-brand" />
              {t("admin.stats.avgSalary")}
            </p>
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-3xl font-bold text-gray-900">
                {averageSalary().toLocaleString()}{" "}
                <span className="text-base font-medium text-gray-500">MAD</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">{t("common.perMonth")}</p>
              <div className="mt-3">
                <Badge tone="green">{o.active} {t("admin.stats.activeOffers")}</Badge>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
