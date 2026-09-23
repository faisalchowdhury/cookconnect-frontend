// Applications + saved profiles.
//
// Change Requirements 10 is explicit that an employer sees two distinct sources
// of candidates: (1) those who applied to one of its offers, and (2) those it
// bookmarked while browsing profiles without any offer being involved.

import { CANDIDATES } from "./candidates";
import { JOBS } from "./jobs";
import { CURRENT_EMPLOYER_ID } from "./employers";

const STATUSES = ["pending", "shortlisted", "rejected", "hired"];

const employerJobs = JOBS.filter((j) => j.employerId === CURRENT_EMPLOYER_ID);

/** Candidates who applied to one of the current employer's offers. */
export const APPLICATIONS = employerJobs.flatMap((job, jIdx) =>
  CANDIDATES.slice(jIdx * 2, jIdx * 2 + 3).map((cand, cIdx) => ({
    id: `app-${job.id}-${cand.id}`,
    jobId: job.id,
    jobTitle: job.title,
    candidateId: cand.id,
    employerId: job.employerId,
    status: STATUSES[(jIdx + cIdx) % STATUSES.length],
    appliedAt: `2026-08-${String(1 + ((jIdx * 3 + cIdx) % 16)).padStart(2, "0")}`,
    source: "applied",
  }))
);

/** Candidates the employer bookmarked while browsing — no application involved. */
export const SAVED_PROFILES = [
  { id: "sav-1", employerId: CURRENT_EMPLOYER_ID, candidateId: "cand-4", savedAt: "2026-08-12", note: "Profil sushi très solide" },
  { id: "sav-2", employerId: CURRENT_EMPLOYER_ID, candidateId: "cand-13", savedAt: "2026-08-10", note: "" },
  { id: "sav-3", employerId: CURRENT_EMPLOYER_ID, candidateId: "cand-17", savedAt: "2026-08-08", note: "À rappeler en septembre" },
  { id: "sav-4", employerId: CURRENT_EMPLOYER_ID, candidateId: "cand-24", savedAt: "2026-08-05", note: "" },
  { id: "sav-5", employerId: CURRENT_EMPLOYER_ID, candidateId: "cand-27", savedAt: "2026-08-02", note: "" },
];

/** Applications submitted by the signed-in candidate, for their dashboard. */
export const MY_APPLICATIONS = [
  { id: "my-1", jobId: "job-1", status: "shortlisted", appliedAt: "2026-08-11" },
  { id: "my-2", jobId: "job-6", status: "pending", appliedAt: "2026-08-09" },
  { id: "my-3", jobId: "job-16", status: "rejected", appliedAt: "2026-08-03" },
  { id: "my-4", jobId: "job-22", status: "pending", appliedAt: "2026-07-29" },
];

export const APPLICATION_STATUS = {
  pending: { fr: "En attente", ar: "فالانتظار", en: "Pending", tone: "amber" },
  shortlisted: { fr: "Présélectionné", ar: "مختار", en: "Shortlisted", tone: "green" },
  rejected: { fr: "Refusé", ar: "مرفوض", en: "Rejected", tone: "red" },
  hired: { fr: "Recruté", ar: "تم التوظيف", en: "Hired", tone: "green" },
};
