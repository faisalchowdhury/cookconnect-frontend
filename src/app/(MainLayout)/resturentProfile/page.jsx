"use client";

// Employer profile as candidates see it.
//
// Change Requirements 08: the phone number is hidden unless the employer has
// explicitly turned display on — this page is the proof of that rule, so it
// reads `phonePublic` rather than printing the number unconditionally.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, Mail, Phone, BadgeCheck, Pencil, Search, Plus,
  Instagram, Linkedin, Globe, Users, Building2, EyeOff,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchCurrentEmployer, fetchEmployerJobs } from "@/mock/api";
import { getCity } from "@/mock/cities";
import { ESTABLISHMENT_TYPES } from "@/mock/jobOptions";
import JobCard from "@/app/component/allJobs/JobCard";
import EmptyState from "@/app/component/ui/EmptyState";

export default function EmployerProfilePage() {
  const t = useT();
  const { pick } = useLocale();

  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    fetchCurrentEmployer().then(setEmployer);
    fetchEmployerJobs().then(setJobs);
  }, []);

  if (!employer) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  const city = getCity(employer.city);
  const type = ESTABLISHMENT_TYPES.find((e) => e.id === employer.type);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-poppins">
      {/* Cover + identity */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="relative h-40 sm:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={employer.cover} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={employer.logo}
                alt=""
                className="-mt-14 h-20 w-20 shrink-0 rounded-xl border-4 border-white object-cover shadow-sm"
              />
              <div>
                <h1 className="flex items-center gap-1.5 text-xl font-bold text-gray-900 sm:text-2xl">
                  {employer.name}
                  {employer.verified && <BadgeCheck size={18} className="text-brand" />}
                </h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
                  <Meta icon={Building2}>{pick(type)}</Meta>
                  <Meta icon={MapPin}>{pick(city)}</Meta>
                  <Meta icon={Users}>{employer.staffCount}</Meta>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/editOwnerProfile"
                className="flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Pencil size={15} />
                {t("employer.editProfile")}
              </Link>
              <Link
                href="/jobPost"
                className="flex items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                <Plus size={15} />
                {t("employer.postJob")}
              </Link>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-gray-700">{employer.about}</p>

          {/* Contact — phone respects the privacy toggle */}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm">
            <Meta icon={Mail}>{employer.email}</Meta>
            {employer.phonePublic ? (
              <Meta icon={Phone}>{employer.phone}</Meta>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-400">
                <EyeOff size={14} />
                {t("employer.phonePublicHint")}
              </span>
            )}
          </div>

          {/* Socials */}
          <div className="mt-4 flex gap-2">
            {employer.socials.instagram && (
              <Social icon={Instagram} href={`https://instagram.com/${employer.socials.instagram}`} />
            )}
            {employer.socials.linkedin && (
              <Social
                icon={Linkedin}
                href={`https://linkedin.com/company/${employer.socials.linkedin}`}
              />
            )}
            {employer.socials.website && <Social icon={Globe} href={employer.socials.website} />}
          </div>

          {/* Find the Best Profiles leads to the search filters (Change Req 09). */}
          <Link
            href="/jobProfile"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-soft sm:w-auto"
          >
            <Search size={16} />
            {t("employer.findBestProfiles")}
          </Link>
        </div>
      </div>

      {/* Active offers */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("employer.activeOffers")}</h2>

        {jobs === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : jobs.active.length === 0 ? (
          <EmptyState title={t("common.noResults")} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {jobs.active.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-gray-600">
      <Icon size={14} />
      {children}
    </span>
  );
}

function Social({ icon: Icon, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-brand-soft hover:text-brand"
    >
      <Icon size={16} />
    </a>
  );
}
