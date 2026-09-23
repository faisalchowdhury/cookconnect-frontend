"use client";

// Contact form. Doubles as the user-feedback channel from Change Requirements
// section 12 — the admin reads and replies, and the user is notified in-app and
// by email.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Phone, MapPin, Check } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { Field, Input, Textarea } from "@/app/component/ui/Fields";
import { submitFeedback } from "@/mock/api";
import { COUNTRY } from "@/mock/cities";

export default function ContactPage() {
  const t = useT();
  const { pick } = useLocale();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    try {
      await submitFeedback(data);
      reset();
      setSent(true);
    } catch {
      setError(t("common.sendError"));
    }
  };

  return (
    <div className="font-poppins">
      <section className="bg-brand-tint px-4 py-14 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("footer.contact")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
          {t("contact.subtitle")}
        </p>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1fr_1.4fr]">
        {/* Contact details */}
        <div className="space-y-4">
          <InfoCard icon={Mail} label={t("common.email")} value="contact@nkhedmou.ma" />
          <InfoCard icon={Phone} label={t("common.phone")} value="+212 5 22 XX XX XX" />
          <InfoCard icon={MapPin} label={t("common.city")} value={`Casablanca, ${pick(COUNTRY)}`} />
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="mb-4 rounded-full bg-brand-soft p-4">
                <Check size={28} className="text-brand" strokeWidth={3} />
              </span>
              <p className="text-lg font-semibold text-gray-900">{t("feedback.thanks")}</p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("common.back")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("auth.firstName")} required error={errors.firstName?.message}>
                  <Input
                    error={errors.firstName}
                    {...register("firstName", { required: t("common.required") })}
                  />
                </Field>
                <Field label={t("auth.lastName")} required error={errors.lastName?.message}>
                  <Input
                    error={errors.lastName}
                    {...register("lastName", { required: t("common.required") })}
                  />
                </Field>
              </div>

              <Field label={t("common.email")} required error={errors.email?.message}>
                <Input
                  type="email"
                  error={errors.email}
                  placeholder="nom@exemple.ma"
                  {...register("email", { required: t("common.required") })}
                />
              </Field>

              <Field label={t("common.phone")}>
                <Input {...register("phone")} />
              </Field>

              <Field label={t("feedback.comments")} required error={errors.message?.message}>
                <Textarea
                  rows={5}
                  error={errors.message}
                  placeholder={t("feedback.commentsPlaceholder")}
                  {...register("message", { required: t("common.required") })}
                />
              </Field>

              {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
              >
                {t("common.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="truncate text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
