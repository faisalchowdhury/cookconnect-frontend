"use client";

// Shared change-password block for candidate and employer profile editors.
// Reuses PasswordField + the same section/card styling as edit profile pages.

import { useState } from "react";
import { Check } from "lucide-react";

import PasswordField from "@/app/component/auth/PasswordField";
import { useT } from "@/i18n/LocaleProvider";
import { isPasswordValid } from "@/lib/validation";
import { changePassword } from "@/mock/api";

export default function ChangePasswordSection() {
  const t = useT();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!currentPassword) next.currentPassword = t("common.required");
    if (!isPasswordValid(password)) next.password = t("auth.passwordRules");
    if (password !== confirmPassword) next.confirmPassword = t("auth.passwordMismatch");
    setErrors(next);
    setApiError("");
    setDone(false);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword: password });
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setDone(true);
    } catch {
      setApiError(t("auth.passwordChangeError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{t("auth.changePassword")}</h2>

      {done && (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-brand-soft p-3 text-sm text-brand-dark">
          <Check size={16} strokeWidth={3} /> {t("auth.passwordChanged")}
        </p>
      )}

      {apiError && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{apiError}</p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <PasswordField
          label={t("auth.currentPassword")}
          value={currentPassword}
          error={errors.currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <PasswordField
          label={t("auth.password")}
          showRules
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <PasswordField
          label={t("auth.confirmPassword")}
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? t("common.loading") : t("auth.changePassword")}
        </button>
      </form>
    </section>
  );
}
