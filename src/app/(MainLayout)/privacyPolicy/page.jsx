"use client";

// Privacy policy, reflecting the commitments the client specified in ClientDoc
// section 20 — contact protection, upload scanning, traceable employer access
// and activity logs.
//
// The sections come from the dictionaries so the page follows the chosen
// language; they used to be an inline French constant, which left this page in
// French for every visitor.
//
// This is drafting support, not legal advice: have it reviewed by a lawyer and
// checked against Moroccan law 09-08 before launch.

import { useT } from "@/i18n/LocaleProvider";


export default function PrivacyPolicyPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-poppins">
      <h1 className="text-3xl font-bold text-gray-900">{t("footer.privacy")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{t("privacyIntro")}</p>

      <div className="mt-10 space-y-9">
        {t("privacySections").map((section) => (
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
