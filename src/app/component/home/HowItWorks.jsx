"use client";

// Change Requirements section 03:
//
//   "'What Makes Us Different' — Replace the 4 current points with a simple
//    step-by-step visual showing visitors how to sign up and explore the
//    platform."
//
// This replaces the old four-card Features grid.

import { UserPlus, FileText, Search, Send } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";

const STEPS = [
  { n: 1, icon: UserPlus, key: "one" },
  { n: 2, icon: FileText, key: "two" },
  { n: 3, icon: Search, key: "three" },
  { n: 4, icon: Send, key: "four" },
];

export default function HowItWorks() {
  const t = useT();

  return (
    <section className="bg-white px-4 py-16 font-poppins">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("home.howItWorks")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
            {t("home.howItWorksSubtitle")}
          </p>
        </div>

        <ol className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line, desktop only — decorative. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent lg:block"
          />

          {STEPS.map(({ n, icon: Icon, key }) => (
            <li key={key} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-brand-soft text-brand shadow-sm">
                <Icon size={22} strokeWidth={1.75} />
                <span className="absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {n}
                </span>
              </span>

              <h3 className="text-base font-semibold text-gray-900">
                {t(`home.steps.${key}.title`)}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-600">
                {t(`home.steps.${key}.desc`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
