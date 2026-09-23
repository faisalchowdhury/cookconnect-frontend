"use client";

// Change Requirements section 06:
//
//   "Minimal Sign-Up Fields — Initial sign-up only requires: First name, Last
//    name, Email, Password, Confirm Password. Do NOT ask for everything upfront."
//
//   "Post-Registration Redirect — After sign-up, redirect the candidate directly
//    to the Edit My Profile page."
//
// Section 01 supplies the role wording: 'I'm a cook' becomes 'I'm looking for a
// job' and 'I'm a restaurant' becomes 'I'm an employer'.

import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { ChefHat, Building2 } from "lucide-react";

import AuthShell, { GoogleButton, Divider } from "@/app/component/auth/AuthShell";
import PasswordField from "@/app/component/auth/PasswordField";
import { Field, Input } from "@/app/component/ui/Fields";
import { useT } from "@/i18n/LocaleProvider";
import { useSession, ROLES } from "@/lib/session";
import { isPasswordValid } from "@/lib/validation";
import { USE_API } from "@/mock/api";

function SignUpForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { login, registerAndStart } = useSession();

  const [role, setRole] = useState(
    params.get("role") === "employer" ? ROLES.EMPLOYER : ROLES.CANDIDATE
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  // useWatch rather than watch(): watch() returns a fresh function each render
  // that React Compiler cannot memoize, so it opts the whole component out of
  // optimisation.
  const password = useWatch({ control, name: "password", defaultValue: "" });

  const onSubmit = async (data) => {
    if (USE_API) {
      const apiRole = role === ROLES.EMPLOYER ? "employer" : "candidate";
      await registerAndStart({
        email: data.email,
        password: data.password,
        role,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      router.push(
        `/verifyCode?email=${encodeURIComponent(data.email)}&purpose=verify-email&role=${apiRole}`
      );
      return;
    }

    login(role);
    router.push(role === ROLES.EMPLOYER ? "/resturentProfileForm" : "/editProfile");
  };

  const finishWithGoogle = () => {
    if (USE_API) return;
    login(role);
    router.push(role === ROLES.EMPLOYER ? "/resturentProfileForm" : "/editProfile");
  };

  return (
    <AuthShell
      title={t("auth.joinTitle")}
      subtitle={t("auth.signUpSubtitle")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link href="/signIn" className="font-medium text-accent hover:underline">
            {t("auth.signIn")}
          </Link>
        </>
      }
    >
      {/* Account type */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-700">{t("auth.accountType")}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("auth.firstName")} required error={errors.firstName?.message}>
            <Input
              error={errors.firstName}
              placeholder={t("auth.firstName")}
              {...register("firstName", { required: t("common.required") })}
            />
          </Field>
          <Field label={t("auth.lastName")} required error={errors.lastName?.message}>
            <Input
              error={errors.lastName}
              placeholder={t("auth.lastName")}
              {...register("lastName", { required: t("common.required") })}
            />
          </Field>
        </div>

        <Field label={t("auth.email")} required error={errors.email?.message}>
          <Input
            type="email"
            error={errors.email}
            placeholder="nom@exemple.ma"
            {...register("email", {
              required: t("common.required"),
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("common.required") },
            })}
          />
        </Field>

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

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-0.5 accent-[#E87B35]"
            {...register("terms", { required: true })}
          />
          <span>
            {t("footer.terms")}{" "}
            <Link href="/terms" className="text-accent underline">
              {t("footer.legal")}
            </Link>
          </span>
        </label>
        {errors.terms && <p className="text-sm text-red-500">{t("common.required")}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {t("auth.createAccount")}
        </button>
      </form>

      <Divider label={t("auth.or")} />
      <GoogleButton onClick={finishWithGoogle} label={t("auth.continueWithGoogle")} />
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

// useSearchParams requires a Suspense boundary during prerender.
export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
