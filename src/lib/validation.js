// Password policy — Change Requirements section 05:
// at least 1 uppercase, 1 lowercase, 1 number and 1 special character.

export const PASSWORD_RULES = [
  { id: "length", labelKey: "auth.ruleLength", test: (v) => v.length >= 8 },
  { id: "upper", labelKey: "auth.ruleUpper", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", labelKey: "auth.ruleLower", test: (v) => /[a-z]/.test(v) },
  { id: "number", labelKey: "auth.ruleNumber", test: (v) => /[0-9]/.test(v) },
  { id: "special", labelKey: "auth.ruleSpecial", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const checkPassword = (value = "") =>
  PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(value) }));

export const isPasswordValid = (value = "") => PASSWORD_RULES.every((r) => r.test(value));

/** 0-5, used to drive the strength meter under the password field. */
export const passwordScore = (value = "") => PASSWORD_RULES.filter((r) => r.test(value)).length;

export const passwordStrength = (value = "") => {
  const score = passwordScore(value);
  if (score <= 2) return { score, level: "weak", labelKey: "auth.strengthWeak", tone: "bg-red-500", width: "33%" };
  if (score <= 4) return { score, level: "medium", labelKey: "auth.strengthMedium", tone: "bg-amber-500", width: "66%" };
  return { score, level: "strong", labelKey: "auth.strengthStrong", tone: "bg-[#679046]", width: "100%" };
};

/** Change Requirements 05: lock the account after 3 failed attempts. */
export const MAX_LOGIN_ATTEMPTS = 3;

export const isValidEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/**
 * Upload guard — ClientDoc section 20 requires file type and size checks
 * before anything is stored.
 */
export const CV_ACCEPT = ".pdf,.doc,.docx";
export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Minimum usable resolution for the client-side photo quality check. */
export const MIN_IMAGE_DIMENSION = 600;

export function validateFile(file, { accept, maxBytes }) {
  if (!file) return { ok: false, reason: "missing" };
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!accept.split(",").includes(ext)) return { ok: false, reason: "type" };
  if (file.size > maxBytes) return { ok: false, reason: "size" };
  return { ok: true };
}

/**
 * Change Requirements 06 "AI Photo Quality Check": reject low-quality uploads at
 * upload time and tell the user immediately, with no admin round-trip. The real
 * scoring happens server-side later; this is the client-side resolution gate.
 */
export function checkImageQuality(
  file,
  { minWidth = MIN_IMAGE_DIMENSION, minHeight = MIN_IMAGE_DIMENSION } = {}
) {
  return new Promise((resolve) => {
    const basic = validateFile(file, { accept: IMAGE_ACCEPT, maxBytes: IMAGE_MAX_BYTES });
    if (!basic.ok) return resolve({ ok: false, reason: basic.reason });

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const ok = img.width >= minWidth && img.height >= minHeight;
      // Keep the object URL alive only when the caller will use it as a preview;
      // release it straight away when the image is rejected.
      if (!ok) URL.revokeObjectURL(url);
      resolve({
        ok,
        reason: ok ? null : "quality",
        width: img.width,
        height: img.height,
        url: ok ? url : null,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ ok: false, reason: "corrupt" });
    };
    img.src = url;
  });
}
