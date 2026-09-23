"use client";

// Password reset entry point. Change Requirements 05: reset works by email, and
// a WhatsApp route is offered as an additional option to explore.

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";

import AuthShell, { Divider } from "@/app/component/auth/AuthShell";
import { Field, Input } from "@/app/component/ui/Fields";
import { useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";
import { USE_API } from "@/mock/api";

export default function SendEmailPage() {
  const t = useT();
  const router = useRouter();
  const { requestPasswordReset } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    if (USE_API) {
      await requestPasswordReset(data.email);
      router.push(
        `/verifyCode?email=${encodeURIComponent(data.email)}&purpose=reset-password`
      );
      return;
    }
    router.push(`/verifyCode?target=${encodeURIComponent(data.email)}`);
  };

  return (
    <AuthShell
      title={t("auth.sendEmailTitle")}
      subtitle={t("auth.sendEmailSubtitle")}
      footer={
        <Link href="/signIn" className="font-medium text-accent hover:underline">
          {t("common.back")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          <Mail size={16} />
          {t("auth.sendCode")}
        </button>
      </form>

      <Divider label={t("auth.or")} />

      <button
        type="button"
        onClick={() => router.push("/verifyCode?channel=whatsapp")}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <MessageCircle size={16} className="text-brand" />
        {t("auth.resetViaWhatsapp")}
      </button>
    </AuthShell>
  );
}
