"use client";

// OTP verification — used both for password reset and for the 3-strike account
// lock in Change Requirements 05.

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import AuthShell from "@/app/component/auth/AuthShell";
import { useT } from "@/i18n/LocaleProvider";
import { useSession, ROLES } from "@/lib/session";
import { USE_API } from "@/mock/api";

const LENGTH = 6;
const RESEND_SECONDS = 45;

function VerifyCodeForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { completeOtp, resendVerification, requestPasswordReset } = useSession();

  const email = params.get("email") || params.get("target") || "";
  const purpose = params.get("purpose") || (params.get("reason") === "locked" ? "reset-password" : "");
  const target = email || "+212 6 •• •• •• ••";
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const setDigit = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const onKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const complete = digits.every(Boolean);
  const code = digits.join("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complete) return;

    if (USE_API && purpose === "reset-password") {
      router.push(`/setNewPass?email=${encodeURIComponent(email)}&code=${code}`);
      return;
    }

    if (USE_API && purpose === "verify-email" && email) {
      setSubmitting(true);
      try {
        const result = await completeOtp(email, code);
        if (result?.role) {
          router.push(result.role === ROLES.EMPLOYER ? "/resturentProfileForm" : "/editProfile");
          return;
        }
        router.push("/signIn");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    router.push("/setNewPass");
  };

  const handleResend = async () => {
    if (USE_API && email) {
      if (purpose === "reset-password") {
        await requestPasswordReset(email);
      } else {
        await resendVerification(email);
      }
    }
    setSeconds(RESEND_SECONDS);
  };

  return (
    <AuthShell title={t("auth.otpTitle")} subtitle={t("auth.otpSubtitle", { target })}>
      <div className="mb-6 flex justify-center">
        <span className="rounded-full bg-brand-soft p-4">
          <ShieldCheck size={26} className="text-brand" />
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* dir="ltr" keeps the code boxes left-to-right even in the Darija RTL layout. */}
        <div dir="ltr" className="mb-6 flex justify-center gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`${i + 1}`}
              className="h-12 w-11 rounded-md border border-gray-300 text-center text-lg font-semibold outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!complete || submitting}
          className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("auth.verify")}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {seconds > 0 ? (
          <span className="text-gray-500">{t("auth.otpResendIn", { n: seconds })}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-accent hover:underline"
          >
            {t("auth.otpResend")}
          </button>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense>
      <VerifyCodeForm />
    </Suspense>
  );
}
