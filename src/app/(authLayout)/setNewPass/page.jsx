"use client";

// New password screen, enforcing the same policy as sign-up
// (Change Requirements 05).

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";

import AuthShell from "@/app/component/auth/AuthShell";
import PasswordField from "@/app/component/auth/PasswordField";
import { useT } from "@/i18n/LocaleProvider";
import { isPasswordValid } from "@/lib/validation";
import { USE_API, resetPassword } from "@/mock/api";

// Wrong, expired or over-used codes, or a link that lost its email/code: the user needs a new code.
const CODE_PROBLEM_STATUSES = [400, 404, 422, 429];

export default function SetNewPassPage() {
  const t = useT();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = useWatch({ control, name: "password", defaultValue: "" });

  if (done) {
    return (
      <AuthShell title={t("auth.resetTitle")}>
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 rounded-full bg-brand-soft p-4">
            <Check size={28} className="text-brand" strokeWidth={3} />
          </span>
          <p className="text-sm text-gray-600">{t("profile.savedOk")}</p>
          <button
            onClick={() => router.push("/signIn")}
            className="mt-6 w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("auth.signIn")}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("auth.resetTitle")} subtitle={t("auth.resetSubtitle")}>
      <form
        onSubmit={handleSubmit(async (data) => {
          setError(null);
          if (USE_API) {
            const params = new URLSearchParams(window.location.search);
            try {
              await resetPassword({
                email: params.get("email"),
                code: params.get("code"),
                password: data.password,
              });
            } catch (err) {
              setError(CODE_PROBLEM_STATUSES.includes(err.statusCode) ? "code" : "failed");
              return;
            }
          }
          setDone(true);
        })}
        className="space-y-4"
      >
        <PasswordField
          label={t("auth.password")}
          showRules
          value={password}
          error={errors.password?.message}
          registration={register("password", {
            required: t("common.required"),
            validate: (v) => isPasswordValid(v) || t("auth.passwordRules"),
          })}
        />

        <PasswordField
          label={t("auth.confirmPassword")}
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword", {
            required: t("common.required"),
            validate: (v) => v === password || t("auth.passwordMismatch"),
          })}
        />

        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-red-50 p-2.5 text-sm text-red-700"
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              {error === "code" ? t("auth.resetCodeInvalid") : t("auth.resetFailed")}
              {error === "code" && (
                <Link href="/sendEmail" className="ms-1 font-medium underline">
                  {t("auth.resetRequestNew")}
                </Link>
              )}
            </span>
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {t("common.save")}
        </button>
      </form>
    </AuthShell>
  );
}
