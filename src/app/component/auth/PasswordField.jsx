"use client";

// Password input with the live policy checklist and strength meter required by
// Change Requirements section 05:
// "at least 1 uppercase, 1 lowercase, 1 number, 1 special character".

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { checkPassword, passwordStrength } from "@/lib/validation";

export default function PasswordField({
  label,
  error,
  value = "",
  showRules = false,
  registration,
  ...props
}) {
  const t = useT();
  const [visible, setVisible] = useState(false);

  const rules = showRules ? checkPassword(value) : [];
  const strength = passwordStrength(value);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          {...registration}
          {...props}
          className={`w-full rounded-md border px-3 py-2 pe-10 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${
            error ? "border-red-400" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "hide" : "show"}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {showRules && value.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${strength.tone}`}
              style={{ width: strength.width }}
            />
          </div>
          <p className="mb-2 text-xs font-medium text-gray-600">
            {t("auth.passwordRules")} <span className="text-gray-400">— {t(strength.labelKey)}</span>
          </p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 text-xs ${
                  rule.passed ? "text-brand" : "text-gray-400"
                }`}
              >
                {rule.passed ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                {t(rule.labelKey)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
