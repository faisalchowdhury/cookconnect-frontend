"use client";

// Employer profile editor.
//
// Change Requirements section 08:
//  - "Establishment Photo / Logo": upload to increase credibility.
//  - "Phone Number Privacy": the number must NOT be shown to candidates, with a
//    toggle to activate/deactivate display.
//  - "Save & Continue to Recruitment": a button that goes to the search page.
//  - "Social Links": Instagram, LinkedIn and other relevant networks.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, Instagram, Linkedin, Globe, EyeOff, Eye } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { Field, Input, Select, Textarea } from "@/app/component/ui/Fields";
import { AvatarUploader } from "@/app/component/ui/ImageUploader";
import {
  blobUrlToFile,
  fetchCurrentEmployer,
  saveCurrentEmployer,
  uploadEmployerLogo,
  uploadEmployerCover,
  USE_API,
} from "@/mock/api";
import { CITIES, COUNTRY } from "@/mock/cities";
import { ESTABLISHMENT_TYPES } from "@/mock/jobOptions";
import ChangePasswordSection from "@/app/component/auth/ChangePasswordSection";

export default function EditEmployerProfilePage() {
  const t = useT();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurrentEmployer().then(setProfile);
  }, []);

  const set = (key, value) => setProfile((p) => ({ ...p, [key]: value }));
  const setSocial = (key, value) =>
    setProfile((p) => ({ ...p, socials: { ...p.socials, [key]: value } }));

  const handleSave = async () => {
    setError("");
    try {
      let next = profile;
      if (USE_API && profile.logo?.startsWith("blob:")) {
        const file = await blobUrlToFile(profile.logo, "logo.jpg");
        next = await uploadEmployerLogo(file);
        next = { ...profile, ...next, logo: next.logo };
      }
      if (USE_API && next.cover?.startsWith("blob:")) {
        const file = await blobUrlToFile(next.cover, "cover.jpg");
        const uploaded = await uploadEmployerCover(file);
        next = { ...next, ...uploaded, cover: uploaded.cover };
      }
      const savedProfile = await saveCurrentEmployer(next);
      setProfile((p) => ({ ...p, ...savedProfile }));
      setSaved(true);
    } catch {
      setSaved(false);
      setError(t("common.saveError"));
    }
  };

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 font-poppins">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("employer.editProfile")}</h1>
      </header>

      {saved && (
        <p className="mb-6 flex items-center gap-2 rounded-md bg-brand-soft p-3 text-sm text-brand-dark">
          <Check size={16} strokeWidth={3} /> {t("profile.savedOk")}
        </p>
      )}

      {error && <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-6">
        <Section title={t("employer.establishmentPhoto")}>
          <AvatarUploader
            round={false}
            value={profile.logo}
            onChange={(v) => set("logo", v)}
            hint={t("employer.establishmentPhotoHint")}
          />
        </Section>

        <Section title={t("employer.coverPhoto")}>
          <AvatarUploader
            round={false}
            value={profile.cover}
            onChange={(v) => set("cover", v)}
            hint={t("employer.coverPhotoHint")}
            minHeight={300}
            qualityError={t("employer.coverQualityError")}
          />
        </Section>

        <Section title={t("employer.profileTitle")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("profile.establishment")} required>
              <Input value={profile.name} onChange={(e) => set("name", e.target.value)} />
            </Field>

            <Field label={t("common.establishmentType")} required>
              <Select
                options={ESTABLISHMENT_TYPES}
                placeholder={t("common.select")}
                value={profile.type}
                onChange={(e) => set("type", e.target.value)}
              />
            </Field>

            <Field label={t("common.country")}>
              <Input value={COUNTRY.fr} disabled readOnly />
            </Field>

            <Field label={t("common.city")} required>
              <Select
                options={CITIES}
                placeholder={t("common.select")}
                value={profile.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>

            <Field label={t("common.email")} required>
              <Input type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} />
            </Field>

            <Field label={t("common.phone")} required>
              <Input value={profile.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label={t("profile.about")}>
              <Textarea rows={4} value={profile.about} onChange={(e) => set("about", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Phone privacy — off by default, per platform privacy rules */}
        <Section title={t("common.phone")}>
          <button
            type="button"
            onClick={() => set("phonePublic", !profile.phonePublic)}
            className="flex w-full items-start gap-3 rounded-lg border border-gray-200 p-4 text-start transition hover:border-gray-300"
          >
            <span
              className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                profile.phonePublic ? "bg-brand" : "bg-gray-300"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  profile.phonePublic ? "translate-x-5 rtl:-translate-x-5" : ""
                }`}
              />
            </span>

            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                {profile.phonePublic ? <Eye size={15} /> : <EyeOff size={15} />}
                {t("employer.phonePublic")}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                {t("employer.phonePublicHint")}
              </span>
            </span>
          </button>
        </Section>

        <Section title={t("employer.socialLinks")}>
          <div className="space-y-3">
            <SocialInput
              icon={Instagram}
              label="Instagram"
              prefix="instagram.com/"
              value={profile.socials.instagram}
              onChange={(v) => setSocial("instagram", v)}
            />
            <SocialInput
              icon={Linkedin}
              label="LinkedIn"
              prefix="linkedin.com/company/"
              value={profile.socials.linkedin}
              onChange={(v) => setSocial("linkedin", v)}
            />
            <SocialInput
              icon={Globe}
              label="Site web"
              prefix="https://"
              value={profile.socials.website}
              onChange={(v) => setSocial("website", v)}
            />
          </div>
        </Section>

        <ChangePasswordSection />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={handleSave}
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {t("common.save")}
        </button>

        {/* Saves and goes straight to the recruitment search. */}
        <button
          onClick={() => router.push("/jobProfile")}
          className="flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          <Search size={16} />
          {t("employer.saveAndRecruit")}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function SocialInput({ icon: Icon, label, prefix, value, onChange }) {
  return (
    <label className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
        <span className="flex items-center overflow-hidden rounded-md border border-gray-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
          <span className="shrink-0 bg-gray-50 px-2 py-2 text-xs text-gray-400">{prefix}</span>
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="min-w-0 flex-1 px-2 py-2 text-sm outline-none"
          />
        </span>
      </span>
    </label>
  );
}
