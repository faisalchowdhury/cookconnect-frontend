"use client";

// Change Requirements section 03:
//   "Stats Text — Change 'Satisfaction Rate' -> 'People who successfully found a job'"
//
// So the third figure is now a count of successful placements, not a percentage.

import { Users, Building2, BriefcaseBusiness } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";

export default function Stats() {
  const t = useT();

  const stats = [
    { icon: Users, value: "500+", labelKey: "home.stats.cooks", color: "text-brand" },
    { icon: Building2, value: "150+", labelKey: "home.stats.restaurants", color: "text-accent" },
    { icon: BriefcaseBusiness, value: "320+", labelKey: "home.stats.hired", color: "text-brand-dark" },
  ];

  return (
    <section className="bg-white px-4 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map(({ icon: Icon, value, labelKey, color }) => (
          <div key={labelKey} className="text-center">
            <Icon className={`mx-auto mb-3 h-10 w-10 ${color}`} strokeWidth={1.5} />
            <div className="text-3xl font-bold text-gray-900 lg:text-4xl">{value}</div>
            <div className="mt-1 text-sm font-medium text-gray-600">{t(labelKey)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
