// Profile completeness gate — Change Requirements section 06.
//
// "If a candidate tries to apply without completing required fields, show a
//  banner: 'Incomplete Profile' and redirect to Edit My Profile."
//
// The required set comes from ClientDoc section 4 (candidate profile fields).

export const REQUIRED_CANDIDATE_FIELDS = [
  { id: "firstName", labelKey: "auth.firstName" },
  { id: "lastName", labelKey: "auth.lastName" },
  { id: "phone", labelKey: "common.phone" },
  { id: "city", labelKey: "common.city" },
  { id: "sectorId", labelKey: "common.sector" },
  { id: "positionId", labelKey: "common.position" },
  { id: "experience", labelKey: "common.experience" },
  { id: "availability", labelKey: "common.availability" },
  { id: "photo", labelKey: "profile.profilePhoto" },
];

const filled = (value) => {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim() !== "";
};

/**
 * @returns {{ percent: number, missing: Array, isComplete: boolean }}
 */
export function getProfileCompletion(profile) {
  if (!profile) return { percent: 0, missing: REQUIRED_CANDIDATE_FIELDS, isComplete: false };

  const missing = REQUIRED_CANDIDATE_FIELDS.filter((f) => !filled(profile[f.id]));
  const done = REQUIRED_CANDIDATE_FIELDS.length - missing.length;

  return {
    percent: Math.round((done / REQUIRED_CANDIDATE_FIELDS.length) * 100),
    missing,
    isComplete: missing.length === 0,
  };
}

export const canApply = (profile) => getProfileCompletion(profile).isComplete;
