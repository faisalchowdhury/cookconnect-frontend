"use client";

// Terms & conditions, with clauses matching the rules the client specified
// (offer approval, 60-day expiry, contact privacy, photo eligibility). Have a
// lawyer review before launch.
//
// The clauses come from the dictionaries so the page follows the chosen
// language; they used to be an inline French constant, which left this page in
// French for every visitor.

import { useT } from "@/i18n/LocaleProvider";


export default function TermsPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-poppins">
      <h1 className="text-3xl font-bold text-gray-900">{t("footer.terms")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{t("termsIntro")}</p>

      <div className="mt-10 space-y-9">
        {t("termsSections").map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">{section.title}</h2>
            <div className="space-y-3">
              {section.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-gray-700">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
