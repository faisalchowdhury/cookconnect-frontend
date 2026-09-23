"use client";

// User feedback — Change Requirements section 12. Admin reads and replies, and
// the user is notified in-app and by email; the submit side is what the
// frontend owns.

import { forwardRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { ChefHat, MessageSquare, X, Check } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { submitFeedback } from "@/mock/api";

export default function FeedbackWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const close = () => {
    setOpen(false);
    setSent(false);
    setRating(0);
    setError("");
    reset();
  };

  const onSubmit = async (data) => {
    setError("");
    // The API requires a 1–5 rating.
    if (!rating) {
      setError(t("feedback.selectOption"));
      return;
    }
    try {
      await submitFeedback({ ...data, rating });
      setSent(true);
    } catch {
      setError(t("common.sendError"));
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed end-0 top-1/2 z-30 flex -translate-y-1/2 items-center gap-2 rounded-s-lg bg-brand px-3 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-brand-dark"
      >
        <MessageSquare size={16} />
        <span className="hidden sm:inline">{t("feedback.button")}</span>
      </button>

      {/* Portalled to <body> for the same reason as the signup gate: an overlay
          inserted and removed inline among page siblings is what triggers
          "NotFoundError: Failed to execute 'removeChild' on 'Node'" once a
          browser extension has touched that part of the tree. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 font-poppins"
          onClick={close}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label={t("common.close")}
              className="absolute end-4 top-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="mb-4 rounded-full bg-brand-soft p-4">
                  <Check size={28} className="text-brand" strokeWidth={3} />
                </span>
                <p className="text-lg font-semibold text-gray-900">{t("feedback.thanks")}</p>
                <button
                  onClick={close}
                  className="mt-6 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white"
                >
                  {t("common.close")}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-2">
                  <ChefHat className="text-accent" size={22} />
                  <h2 className="text-lg font-semibold text-gray-900">{t("feedback.title")}</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-gray-800">
                      {t("feedback.usingAs")}
                    </legend>
                    <div className="space-y-2">
                      <Radio {...register("role", { required: true })} value="candidate">
                        {t("feedback.asCook")}
                      </Radio>
                      <Radio {...register("role", { required: true })} value="employer">
                        {t("feedback.asEmployer")}
                      </Radio>
                    </div>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-500">{t("feedback.selectOption")}</p>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-gray-800">
                      {t("feedback.helpful")}
                    </legend>
                    <div className="space-y-2">
                      <Radio {...register("helpful", { required: true })} value="yes" tone="green">
                        {t("feedback.helpfulYes")}
                      </Radio>
                      <Radio {...register("helpful", { required: true })} value="no" tone="red">
                        {t("feedback.helpfulNo")}
                      </Radio>
                    </div>
                    {errors.helpful && (
                      <p className="mt-1 text-sm text-red-500">{t("feedback.selectOption")}</p>
                    )}
                  </fieldset>

                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-800">{t("feedback.rating")}</p>
                    <div className="flex justify-center gap-1 text-3xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          aria-label={`${star}`}
                          className={star <= rating ? "text-amber-400" : "text-gray-300"}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-center text-xs text-gray-500">
                      {t("feedback.ratingHint")}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      {t("feedback.comments")}
                    </label>
                    <textarea
                      {...register("comments")}
                      rows={4}
                      placeholder={t("feedback.commentsPlaceholder")}
                      className="w-full rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>

                  {error && (
                    <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t("feedback.later")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
                    >
                      {t("feedback.submit")}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const TONES = {
  default: "border-gray-200 text-gray-700",
  green: "border-brand/40 text-brand-dark",
  red: "border-red-200 text-red-700",
};

// forwardRef so the `ref` that register() spreads reaches the real <input>
// rather than being dropped on a plain function component.
const Radio = forwardRef(function Radio({ children, tone = "default", ...props }, ref) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm transition hover:bg-gray-50 ${TONES[tone]}`}
    >
      <input type="radio" ref={ref} className="accent-[#679046]" {...props} />
      {children}
    </label>
  );
});
