"use client";

// Edit My Profile — the screen sign-up redirects to, and the screen the
// "Incomplete Profile" gate sends people back to.
//
// Change Requirements section 06 drives most of this file:
//  - "Sector -> Job Position Flow": the position dropdown stays disabled until a
//    sector is chosen, and then only lists that sector's positions.
//  - "No Free-Text for Job Fields": job title, sector and experience are
//    dropdowns only.
//  - "CV Upload OR CV Builder": two routes to a CV, presented as tabs.
//  - "Food Photo Upload (Selected Roles)": only for the eligible kitchen /
//    bakery / pastry / Asian roles, capped at 8.
//  - "Profile Photo": with a recommendation to use a professional photo.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Plus, Trash2, Check, AlertTriangle, Lock } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { Field, Input, Select, Textarea } from "@/app/component/ui/Fields";
import { AvatarUploader, PhotoGridUploader } from "@/app/component/ui/ImageUploader";
import {
  SECTORS, getPositions, canUploadFoodPhotos, MAX_FOOD_PHOTOS, POSITIONS_BY_SECTOR,
} from "@/mock/sectors";
import { CITIES, COUNTRY } from "@/mock/cities";
import { EXPERIENCE_LEVELS, AVAILABILITY, CONTRACT_TYPES } from "@/mock/jobOptions";
import {
  blobUrlToFile,
  fetchCurrentCandidate,
  saveCurrentCandidate,
  uploadCandidateCv,
  uploadCandidateDishPhotos,
  uploadCandidatePhoto,
  USE_API,
} from "@/mock/api";
import { useTaxonomyVersion } from "@/components/TaxonomyHydrator";
import { getProfileCompletion } from "@/lib/profileCompletion";
import { CV_ACCEPT, CV_MAX_BYTES, validateFile } from "@/lib/validation";
import ChangePasswordSection from "@/app/component/auth/ChangePasswordSection";

const emptyTraining = { school: "", diploma: "", from: "", to: "" };
// A past role is stored as a position id, never as typed text: Change
// Requirements 08 "No Free-Text for Job Fields" applies to the work history
// too, which was the one place a candidate could still type any job title they
// liked. `establishment` stays free text — it is a business name, so no list
// can cover it.
const emptyHistory = { establishment: "", positionId: "", from: "", to: "" };

export default function EditProfilePage() {
  const t = useT();
  const router = useRouter();
  const taxonomyVersion = useTaxonomyVersion();

  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cvMode, setCvMode] = useState("upload");
  const [cvFile, setCvFile] = useState(null);
  const [cvError, setCvError] = useState("");

  useEffect(() => {
    fetchCurrentCandidate().then((data) =>
      setProfile({
        ...data,
        training: data.training?.length ? data.training : [emptyTraining],
        history: data.history?.length ? data.history : [emptyHistory],
      })
    );
  }, []);

  const set = (key, value) =>
    setProfile((p) => {
      // Changing sector invalidates the chosen position — it may not belong to
      // the new sector's list.
      if (key === "sectorId") return { ...p, sectorId: value, positionId: "" };
      return { ...p, [key]: value };
    });

  const positions = useMemo(
    () => getPositions(profile?.sectorId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positions live in module-level lists the API hydrates; the version forces a re-read
    [profile?.sectorId, taxonomyVersion]
  );
  const foodPhotosAllowed = profile
    ? canUploadFoodPhotos(profile.sectorId, profile.positionId)
    : false;
  const completion = useMemo(() => getProfileCompletion(profile), [profile]);

  const setRow = (listKey, index, key, value) =>
    setProfile((p) => {
      const list = [...p[listKey]];
      list[index] = { ...list[index], [key]: value };
      return { ...p, [listKey]: list };
    });

  const addRow = (listKey, blank) =>
    setProfile((p) => ({ ...p, [listKey]: [...p[listKey], { ...blank }] }));

  const removeRow = (listKey, index) =>
    setProfile((p) => ({ ...p, [listKey]: p[listKey].filter((_, i) => i !== index) }));

  const onCvChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = validateFile(file, { accept: CV_ACCEPT, maxBytes: CV_MAX_BYTES });
    if (!result.ok) {
      setCvError(t("profile.cvUploadHint"));
      setCvFile(null);
      return;
    }
    setCvError("");
    setCvFile(file);
  };

  // Saving has to persist, not just show a banner. The "Incomplete Profile"
  // gate on an offer sends a candidate here to fill in what is missing; if the
  // save is cosmetic, the next read returns the original blank fields and they
  // are still blocked — the gate becomes impossible to clear.
  const [saveError, setSaveError] = useState("");

  const onSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      let working = profile;

      if (USE_API) {
        if (working.photo?.startsWith("blob:")) {
          const file = await blobUrlToFile(working.photo, "photo.jpg");
          const uploaded = await uploadCandidatePhoto(file);
          working = { ...working, photo: uploaded.photo || working.photo };
        }

        const blobFood = (working.foodPhotos || []).filter((url) => String(url).startsWith("blob:"));
        if (blobFood.length) {
          const files = await Promise.all(
            blobFood.map((url, index) => blobUrlToFile(url, `dish-${index}.jpg`))
          );
          const uploaded = await uploadCandidateDishPhotos(files);
          working = { ...working, foodPhotos: uploaded.foodPhotos || working.foodPhotos };
        }

        if (cvFile) {
          await uploadCandidateCv(cvFile);
          setCvFile(null);
        }
      }

      const next = await saveCurrentCandidate(working);
      setProfile((p) => ({ ...p, ...next, ...working }));
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSaved(false);
      setSaveError(t("common.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // Keep the page header on screen while the profile loads, so the first paint
  // is never a blank page — only the form area is skeletoned.
  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 font-poppins">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("profile.editTitle")}</h1>
          <p className="mt-1 text-sm text-gray-600">{t("profile.editSubtitle")}</p>
        </header>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 font-poppins">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("profile.editTitle")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("profile.editSubtitle")}</p>
      </header>

      {saveError && (
        <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">{saveError}</p>
      )}

      {/* Completion meter + the incomplete-profile warning */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-800">
            {t("profile.completion", { n: completion.percent })}
          </span>
          {completion.isComplete && (
            <span className="flex items-center gap-1 text-brand">
              <Check size={15} strokeWidth={3} /> {t("common.yes")}
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all ${
              completion.isComplete ? "bg-brand" : "bg-amber-500"
            }`}
            style={{ width: `${completion.percent}%` }}
          />
        </div>

        {!completion.isComplete && (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-semibold">{t("profile.incompleteTitle")}</strong> —{" "}
              {t("profile.incompleteBody")}
              <span className="mt-1 block text-xs">
                {completion.missing.map((f) => t(f.labelKey)).join(" · ")}
              </span>
            </span>
          </p>
        )}
      </div>

      {saved && (
        <p className="mb-6 flex items-center gap-2 rounded-md bg-brand-soft p-3 text-sm text-brand-dark">
          <Check size={16} strokeWidth={3} /> {t("profile.savedOk")}
        </p>
      )}

      <div className="space-y-8">
        {/* Photo */}
        <Section title={t("profile.profilePhoto")}>
          <AvatarUploader
            value={profile.photo}
            onChange={(v) => set("photo", v)}
            hint={t("profile.photoHint")}
          />
        </Section>

        {/* Personal */}
        <Section title={t("profile.personalInfo")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("auth.firstName")} required>
              <Input value={profile.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </Field>
            <Field label={t("auth.lastName")} required>
              <Input value={profile.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </Field>
            <Field label={t("common.email")} required>
              <Input type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label={t("common.phone")} required hint={t("profile.contactHidden")}>
              <Input value={profile.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label={t("common.country")}>
              {/* Locked to Morocco while it is the primary market (Change Req 07). */}
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
          </div>
        </Section>

        {/* Professional — dropdowns only, sector gates position */}
        <Section title={t("profile.professionalInfo")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("common.sector")} required>
              <Select
                options={SECTORS}
                placeholder={t("common.select")}
                value={profile.sectorId}
                onChange={(e) => set("sectorId", e.target.value)}
              />
            </Field>

            <Field
              label={t("common.position")}
              required
              hint={!profile.sectorId ? t("common.selectFirst") : undefined}
            >
              <Select
                options={positions}
                placeholder={profile.sectorId ? t("common.select") : t("common.selectFirst")}
                value={profile.positionId}
                disabled={!profile.sectorId}
                onChange={(e) => set("positionId", e.target.value)}
              />
            </Field>

            <Field label={t("common.experience")} required>
              <Select
                options={EXPERIENCE_LEVELS}
                placeholder={t("common.select")}
                value={profile.experience}
                onChange={(e) => set("experience", e.target.value)}
              />
            </Field>

            <Field label={t("common.availability")} required>
              <Select
                options={AVAILABILITY}
                placeholder={t("common.select")}
                value={profile.availability}
                onChange={(e) => set("availability", e.target.value)}
              />
            </Field>

            <Field label={t("common.contractType")}>
              <Select
                options={CONTRACT_TYPES}
                placeholder={t("common.select")}
                value={profile.contractType}
                onChange={(e) => set("contractType", e.target.value)}
              />
            </Field>

            <Field label={t("profile.expectedSalary")}>
              <Input
                type="number"
                value={profile.expectedSalary}
                onChange={(e) => set("expectedSalary", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label={t("profile.about")}>
              <Textarea rows={4} value={profile.about} onChange={(e) => set("about", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Training */}
        <Section title={t("profile.training")}>
          {profile.training.map((row, i) => (
            <RepeaterRow key={i} onRemove={profile.training.length > 1 ? () => removeRow("training", i) : null} label={t("profile.remove")}>
              <Field label={t("profile.school")}>
                <Input value={row.school} onChange={(e) => setRow("training", i, "school", e.target.value)} />
              </Field>
              <Field label={t("profile.diploma")}>
                <Input value={row.diploma} onChange={(e) => setRow("training", i, "diploma", e.target.value)} />
              </Field>
              <Field label={t("profile.from")}>
                <Input placeholder="2018" value={row.from} onChange={(e) => setRow("training", i, "from", e.target.value)} />
              </Field>
              <Field label={t("profile.to")}>
                <Input placeholder="2020" value={row.to} onChange={(e) => setRow("training", i, "to", e.target.value)} />
              </Field>
            </RepeaterRow>
          ))}
          <AddButton onClick={() => addRow("training", emptyTraining)} label={t("profile.addTraining")} />
        </Section>

        {/* Work history */}
        <Section title={t("profile.workHistory")}>
          {profile.history.map((row, i) => (
            <RepeaterRow key={i} onRemove={profile.history.length > 1 ? () => removeRow("history", i) : null} label={t("profile.remove")}>
              <Field label={t("profile.establishment")}>
                <Input value={row.establishment} onChange={(e) => setRow("history", i, "establishment", e.target.value)} />
              </Field>
              <Field label={t("profile.positionHeld")}>
                <Select
                  groups={POSITIONS_BY_SECTOR}
                  placeholder={t("common.select")}
                  value={row.positionId}
                  onChange={(e) => setRow("history", i, "positionId", e.target.value)}
                />
              </Field>
              <Field label={t("profile.from")}>
                <Input placeholder="2021" value={row.from} onChange={(e) => setRow("history", i, "from", e.target.value)} />
              </Field>
              <Field label={t("profile.to")}>
                <Input placeholder="2024" value={row.to} onChange={(e) => setRow("history", i, "to", e.target.value)} />
              </Field>
            </RepeaterRow>
          ))}
          <AddButton onClick={() => addRow("history", emptyHistory)} label={t("profile.addExperience")} />
        </Section>

        {/* CV: upload or build */}
        <Section title={t("profile.cv")}>
          <div className="mb-4 inline-flex rounded-lg border border-gray-200 p-1">
            <TabButton active={cvMode === "upload"} onClick={() => setCvMode("upload")} icon={Upload}>
              {t("profile.cvUpload")}
            </TabButton>
            <TabButton active={cvMode === "builder"} onClick={() => setCvMode("builder")} icon={FileText}>
              {t("profile.cvBuilder")}
            </TabButton>
          </div>

          {cvMode === "upload" ? (
            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-brand">
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {cvFile ? cvFile.name : t("profile.cvUpload")}
                </span>
                <span className="text-xs text-gray-500">{t("profile.cvUploadHint")}</span>
                <input type="file" accept={CV_ACCEPT} onChange={onCvChange} className="hidden" />
              </label>
              {cvError && <p className="mt-2 text-xs text-red-500">{cvError}</p>}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-600">{t("profile.cvBuilderHint")}</p>
              <p className="mt-3 text-sm text-gray-500">
                {t("profile.personalInfo")} · {t("profile.professionalInfo")} · {t("profile.training")} ·{" "}
                {t("profile.workHistory")}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
                <FileText size={15} />
                {t("profile.cvBuilder")}
              </span>
            </div>
          )}
        </Section>

        {/* Food photos — only for eligible roles */}
        <Section title={t("profile.foodPhotos")}>
          {foodPhotosAllowed ? (
            <PhotoGridUploader
              value={profile.foodPhotos}
              onChange={(v) => set("foodPhotos", v)}
              max={MAX_FOOD_PHOTOS}
              hint={t("profile.foodPhotosHint", { max: MAX_FOOD_PHOTOS })}
            />
          ) : (
            <p className="flex items-start gap-2 rounded-md bg-gray-50 p-4 text-sm text-gray-500">
              <Lock size={15} className="mt-0.5 shrink-0" />
              {t("profile.foodPhotosLocked")}
            </p>
          )}
        </Section>
      </div>

      <div className="mt-6">
        <ChangePasswordSection />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? t("common.loading") : t("profile.saveProfile")}
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

function RepeaterRow({ children, onRemove, label }) {
  return (
    <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:underline"
        >
          <Trash2 size={13} /> {label}
        </button>
      )}
    </div>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-brand hover:text-brand"
    >
      <Plus size={15} /> {label}
    </button>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition ${
        active ? "bg-brand text-white" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}
