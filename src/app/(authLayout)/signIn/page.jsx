"use client";

// Change Requirements section 05:
//
//   "3-Strike Lock + OTP Reset — After 3 failed login attempts, temporarily
//    suspend the account. Send an OTP code to the user's phone or email so they
//    can reset their password immediately without admin intervention."
//
// Section 01 supplies the new wording ("Join Nkhedmou.ma", "I'm looking for a
// job", "I'm an employer").
//
// Demo rule: any password that satisfies the policy signs you in; anything else
// counts as a failed attempt, so the lock-out is easy to exercise.

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ChefHat, Building2, AlertTriangle } from "lucide-react";

import AuthShell, { GoogleButton, Divider } from "@/app/component/auth/AuthShell";
import PasswordField from "@/app/component/auth/PasswordField";
import { Field, Input } from "@/app/component/ui/Fields";
import { useT } from "@/i18n/LocaleProvider";
import { useSession, ROLES, DEMO_INCOMPLETE_CANDIDATE } from "@/lib/session";
import { isPasswordValid, MAX_LOGIN_ATTEMPTS } from "@/lib/validation";
import { USE_API } from "@/mock/api";

export default function SignInPage() {
  const t = useT();
  const router = useRouter();
  const { login, loginWithCredentials } = useSession();

  const [role, setRole] = useState(ROLES.CANDIDATE);
  // Demo switch: sign in as a candidate whose profile is missing required
  // fields, so the "Incomplete Profile" gate can be seen without editing data.
  const [incompleteDemo, setIncompleteDemo] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = useWatch({ control, name: "password", defaultValue: "" });

  const isCandidate = role === ROLES.CANDIDATE;

  const signIn = () => {
    login(role, isCandidate && incompleteDemo ? DEMO_INCOMPLETE_CANDIDATE : undefined);
    router.push(role === ROLES.EMPLOYER ? "/resturentDashboard" : "/dashboard");
  };
  const remaining = MAX_LOGIN_ATTEMPTS - attempts;

  const onSubmit = async (data) => {
    if (locked) return;
    setError("");

    if (USE_API) {
      try {
        const session = await loginWithCredentials(data.email, data.password);
        router.push(session.role === ROLES.EMPLOYER ? "/resturentDashboard" : "/dashboard");
      } catch (err) {
        if (err.statusCode === 423) {
          setLocked(true);
          return;
        }
        if (err.statusCode === 401) {
          const next = attempts + 1;
          setAttempts(next);
          if (next >= MAX_LOGIN_ATTEMPTS) setLocked(true);
          return;
        }
        if (err.code === "admin-account") setError(t("auth.signInNotAllowed"));
        else if (err.statusCode === 403) setError(t("auth.signInSuspended"));
        else if (err.statusCode === 429) setError(t("auth.signInRateLimited"));
        else setError(t("auth.signInFailed"));
      }
      return;
    }

    if (!isPasswordValid(data.password)) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_LOGIN_ATTEMPTS) setLocked(true);
      return;
    }

    signIn();
  };

  if (locked) {
    return (
      <AuthShell title={t("auth.lockedTitle")}>
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 rounded-full bg-red-50 p-4">
            <AlertTriangle size={28} className="text-red-500" />
          </span>
          <p className="text-sm leading-relaxed text-gray-600">{t("auth.lockedBody")}</p>
          <Link
            href="/verifyCode?reason=locked"
            className="mt-6 w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("auth.lockedCta")}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("auth.joinTitle")}
      subtitle={t("auth.loginTitle")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link href="/signUp" className="font-medium text-accent hover:underline">
            {t("auth.createAccount")}
          </Link>
        </>
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <RoleOption
          active={role === ROLES.CANDIDATE}
          onClick={() => setRole(ROLES.CANDIDATE)}
          icon={ChefHat}
          label={t("auth.lookingForJob")}
        />
        <RoleOption
          active={role === ROLES.EMPLOYER}
          onClick={() => setRole(ROLES.EMPLOYER)}
          icon={Building2}
          label={t("auth.iAmEmployer")}
        />
      </div>

      {isCandidate && !USE_API && (
        <label className="mb-5 flex items-start gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-0.5 accent-[#E87B35]"
            checked={incompleteDemo}
            onChange={(e) => setIncompleteDemo(e.target.checked)}
          />
          <span>
            <strong className="font-semibold">{t("auth.demoIncomplete")}</strong>
            <span className="block text-xs text-gray-500">{t("auth.demoIncompleteHint")}</span>
          </span>
        </label>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t("auth.email")} required error={errors.email?.message}>
          <Input
            type="email"
            error={errors.email}
            placeholder="nom@exemple.ma"
            {...register("email", { required: t("common.required") })}
          />
        </Field>

        <PasswordField
          label={t("auth.password")}
          value={password}
          error={errors.password?.message}
          registration={register("password", { required: t("common.required") })}
        />

        {attempts > 0 && (
          <p className="flex items-start gap-1.5 rounded-md bg-amber-50 p-2.5 text-sm text-amber-800">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {t("auth.attemptsWarning", { n: remaining })}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-red-50 p-2.5 text-sm text-red-700"
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" className="accent-[#E87B35]" {...register("remember")} />
            {t("auth.rememberMe")}
          </label>
          <Link href="/sendEmail" className="text-accent hover:underline">
            {t("auth.forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {t("auth.signIn")}
        </button>
      </form>

      <Divider label={t("auth.or")} />
      <GoogleButton
        label={t("auth.continueWithGoogle")}
        onClick={() => !USE_API && signIn()}
      />
    </AuthShell>
  );
}

function RoleOption({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border p-3 text-start text-sm font-medium transition ${
        active
          ? "border-brand bg-brand-soft text-brand-dark"
          : "border-gray-200 text-gray-700 hover:border-gray-300"
      }`}
    >
      <Icon size={18} className={active ? "text-brand" : "text-gray-400"} />
      {label}
    </button>
  );
}
