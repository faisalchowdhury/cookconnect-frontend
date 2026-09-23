"use client";

// Post a job offer.
//
// Change Requirements section 08:
//  - "Job Requirements — Dropdowns": availability, skills, hygiene, mobility and
//    languages become checkbox groups, not free text.
//  - "Job Benefits — Dropdowns": same for salary, social protection,
//    meals/transport and working conditions.
//  - "Offer Approval Workflow": after submitting, show "Your job offer is under
//    approval" — nothing goes live without an admin.
//
// Change Requirements section 09: the deadline is capped at 60 days.
//
// The rich-text editor that used to power the requirements and benefits fields
// is gone: free text is exactly what the client asked to remove here.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Check, ArrowLeft } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { Field, Input, Select, Textarea } from "@/app/component/ui/Fields";
import CheckboxGroup from "@/app/component/ui/CheckboxGroup";
import { SECTORS, getPositions } from "@/mock/sectors";
import { CITIES, COUNTRY } from "@/mock/cities";
import {
  JOB_REQUIREMENTS, JOB_BENEFITS, CONTRACT_TYPES,
  ESTABLISHMENT_TYPES, EXPERIENCE_LEVELS,
} from "@/mock/jobOptions";
import { MAX_OFFER_DAYS } from "@/mock/jobs";
import { postJob } from "@/mock/api";
import { useTaxonomyVersion } from "@/components/TaxonomyHydrator";

const today = new Date("2026-08-17T00:00:00Z");
const maxDeadline = new Date(today.getTime() + MAX_OFFER_DAYS * 86400000)
  .toISOString()
  .slice(0, 10);

const EMPTY = {
  sectorId: "",
  positionId: "",
  city: "",
  establishmentType: "",
  contractType: "",
  experience: "",
  salaryMin: "",
  salaryMax: "",
  description: "",
  deadline: maxDeadline,
};

export default function PostJobPage() {
  const t = useT();
  const router = useRouter();
  const taxonomyVersion = useTaxonomyVersion();

  const [form, setForm] = useState(EMPTY);
  const [requirements, setRequirements] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const positions = useMemo(
    () => getPositions(form.sectorId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positions live in module-level lists the API hydrates; the version forces a re-read
    [form.sectorId, taxonomyVersion]
  );

  const set = (key, value) =>
    setForm((f) =>
      key === "sectorId" ? { ...f, sectorId: value, positionId: "" } : { ...f, [key]: value }
    );

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await postJob({ ...form, requirements, benefits });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t("common.saveError"));
    } finally {
      setBusy(false);
    }
  };

  // Nothing is published directly — the confirmation says so explicitly.
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 font-poppins">
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-8 text-center">
          <span className="mb-4 rounded-full bg-amber-50 p-4">
            <Clock size={30} className="text-amber-600" />
          </span>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {t("employer.pendingApprovalTitle")}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600">
            {t("employer.pendingApprovalBody")}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/totalJobPost"
              className="rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              {t("employer.myOffers")}
            </Link>
            <button
              onClick={() => {
                setForm(EMPTY);
                setRequirements([]);
                setBenefits([]);
                setSubmitted(false);
              }}
              className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {t("employer.postJob")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 font-poppins">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-accent"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("common.back")}
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("employer.postJobTitle")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{t("employer.postJobSubtitle")}</p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <Section title={t("employer.jobTitle")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("common.sector")} required>
              <Select
                required
                options={SECTORS}
                placeholder={t("common.select")}
                value={form.sectorId}
                onChange={(e) => set("sectorId", e.target.value)}
              />
            </Field>

            <Field
              label={t("common.position")}
              required
              hint={!form.sectorId ? t("common.selectFirst") : undefined}
            >
              <Select
                required
                options={positions}
                disabled={!form.sectorId}
                placeholder={form.sectorId ? t("common.select") : t("common.selectFirst")}
                value={form.positionId}
                onChange={(e) => set("positionId", e.target.value)}
              />
            </Field>

            <Field label={t("common.country")}>
              <Input value={COUNTRY.fr} disabled readOnly />
            </Field>

            <Field label={t("common.city")} required>
              <Select
                required
                options={CITIES}
                placeholder={t("common.select")}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>

            <Field label={t("common.establishmentType")} required>
              <Select
                required
                options={ESTABLISHMENT_TYPES}
                placeholder={t("common.select")}
                value={form.establishmentType}
                onChange={(e) => set("establishmentType", e.target.value)}
              />
            </Field>

            <Field label={t("common.contractType")} required>
              <Select
                required
                options={CONTRACT_TYPES}
                placeholder={t("common.select")}
                value={form.contractType}
                onChange={(e) => set("contractType", e.target.value)}
              />
            </Field>

            <Field label={t("common.experience")} required>
              <Select
                required
                options={EXPERIENCE_LEVELS}
                placeholder={t("common.select")}
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
              />
            </Field>

            <Field label={t("employer.deadline")} required hint={t("employer.deadlineHint")}>
              <Input
                type="date"
                required
                max={maxDeadline}
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </Field>

            <Field label={`${t("common.salary")} (min)`}>
              <Input
                type="number"
                placeholder="5000"
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
              />
            </Field>

            <Field label={`${t("common.salary")} (max)`}>
              <Input
                type="number"
                placeholder="8000"
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label={t("employer.jobDescription")} required>
              <Textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* Checkboxes, not free text */}
        <Section title={t("common.requirements")}>
          <CheckboxGroup groups={JOB_REQUIREMENTS} value={requirements} onChange={setRequirements} />
        </Section>

        <Section title={t("common.benefits")}>
          <CheckboxGroup groups={JOB_BENEFITS} value={benefits} onChange={setBenefits} />
        </Section>

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/resturentDashboard")}
            className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
          >
            <Check size={16} />
            {t("employer.publish")}
          </button>
        </div>
      </form>
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
