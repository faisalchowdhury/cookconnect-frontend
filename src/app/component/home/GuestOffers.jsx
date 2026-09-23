"use client";

// Home page offer preview.
//
// Change Requirements 03 "Guest Access (Preview Only)": visitors can browse
// offers without registering but only see the first page, and every card gets
// its own Sign Up button (handled inside JobCard).

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { fetchFeaturedJobs } from "@/mock/api";
import JobCard from "@/app/component/allJobs/JobCard";
import { CardSkeleton } from "@/app/component/ui/EmptyState";

export default function GuestOffers() {
  const t = useT();
  const { isLoggedIn } = useSession();
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchFeaturedJobs(6).then((data) => alive && setJobs(data));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="bg-gray-50 px-4 py-16 font-poppins">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("home.latestOffers")}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{t("home.latestOffersSubtitle")}</p>
          </div>

          <Link
            href="/allJobs"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            {t("home.seeAllOffers")}
            <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>
        </div>

        {jobs === null ? (
          <CardSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Conversion prompt under the preview grid. */}
        {!isLoggedIn && (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-accent/30 bg-accent-tint px-6 py-8 text-center">
            <UserPlus size={28} className="text-accent" strokeWidth={1.75} />
            <p className="max-w-md text-sm text-gray-700 sm:text-base">{t("home.guestNotice")}</p>
            <Link
              href="/signUp"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              {t("auth.createAccount")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
