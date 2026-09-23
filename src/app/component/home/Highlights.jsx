"use client";

// Change Requirements section 03, "Icons Section":
//
//   "Replace existing icons with: chef/cook icon, restaurant icon, and a
//    paper/document icon with a green validation logo."
//
// Three icons exactly — this replaces the previous four-card image grid.

import { ChefHat, Store, FileText, BadgeCheck } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";

export default function Highlights() {
  const t = useT();

  const items = [
    { icon: ChefHat, titleKey: "home.different.chefs", descKey: "home.different.chefsDesc" },
    { icon: Store, titleKey: "home.different.restaurants", descKey: "home.different.restaurantsDesc" },
    {
      icon: FileText,
      titleKey: "home.different.verified",
      descKey: "home.different.verifiedDesc",
      // The green validation badge the client asked for, layered on the document.
      badge: true,
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16 font-poppins">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map(({ icon: Icon, titleKey, descKey, badge }) => (
          <div
            key={titleKey}
            className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-7 text-center transition hover:shadow-md"
          >
            <span className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Icon size={28} strokeWidth={1.75} />
              {badge && (
                <BadgeCheck
                  size={22}
                  className="absolute -end-1.5 -bottom-1.5 rounded-full bg-white text-brand"
                  strokeWidth={2}
                />
              )}
            </span>
            <h3 className="text-base font-semibold text-gray-900">{t(titleKey)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
