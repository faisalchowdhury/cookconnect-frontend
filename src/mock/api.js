// Data access layer for the public site.
//
// When NEXT_PUBLIC_API_URL is set, calls the real backend; otherwise serves
// deterministic fixtures so the demo works without a running API.

import { ACTIVE_JOBS, JOBS, getJob, getJobsByEmployer, isExpired, daysLeft } from "./jobs";
import { CANDIDATES, getCandidate, CURRENT_CANDIDATE_ID } from "./candidates";
import { EMPLOYERS, getEmployer, CURRENT_EMPLOYER_ID } from "./employers";
import { APPLICATIONS, SAVED_PROFILES, MY_APPLICATIONS } from "./applications";
import { NOTIFICATIONS } from "./notifications";
import { getJSON, setValue, removeValue, SESSION_KEY } from "@/lib/browserStore";
import { getProfileCompletion } from "@/lib/profileCompletion";
import { ALL_POSITIONS, SECTORS, POSITIONS } from "./sectors";
import { HOME_BANNERS_MIDDLE, HOME_BANNERS_BOTTOM, STICKY_BANNER } from "./banners";
import { PARTNERS } from "./partners";

/** Change Requirements 07: "Display 12 profiles per page". */
export const PAGE_SIZE = 12;

/** Guests only ever see the first page of results (Change Requirements 03). */
export const GUEST_MAX_PAGES = 1;

export const USE_API = Boolean(process.env.NEXT_PUBLIC_API_URL);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000/api/v1";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

const matches = (value, filter) => !filter || filter === "all" || value === filter;

const PLACEHOLDER_LOGO = "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png";
const PLACEHOLDER_PHOTO = "https://i.ibb.co/HD6WMnhg/Rectangle-119.png";

/* ----------------------------------------------------------- API helpers */

function apiError(json, res) {
  const err = new Error(json.message || "Request failed");
  err.statusCode = json.statusCode || res.status;
  return err;
}

async function parseJsonResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw apiError(json, res);
  }
  return json;
}

const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
];

let refreshInFlight = null;

// Parallel 401s share one refresh instead of racing refresh-token rotation.
export function refreshAccessToken() {
  refreshInFlight ??= (async () => {
    const res = await fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" });
    const json = await parseJsonResponse(res);
    const stored = getJSON(SESSION_KEY, null);
    if (stored) setValue(SESSION_KEY, { ...stored, accessToken: json.data.accessToken });
    return json.data.accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

// Access tokens last 15 minutes: retry a 401 once after refreshing, and drop the session if that fails.
async function send(path, init) {
  const request = () =>
    fetch(`${API}${path}`, {
      credentials: "include",
      ...init,
      headers: { ...(init.headers || {}), ...authHeaders() },
    });

  const res = await request();
  const pathname = path.split("?")[0];
  if (res.status !== 401 || NO_REFRESH_PATHS.includes(pathname) || !authHeaders().Authorization) {
    return res;
  }

  try {
    await refreshAccessToken();
  } catch {
    removeValue(SESSION_KEY);
    return res;
  }
  return request();
}

async function api(path, options = {}) {
  const res = await send(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const json = await parseJsonResponse(res);
  return json.data;
}

async function apiWithMeta(path, options = {}) {
  const res = await send(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const json = await parseJsonResponse(res);
  return { data: json.data, meta: json.meta };
}

async function apiForm(path, formData, options = {}) {
  const res = await send(path, { ...options, method: options.method || "POST", body: formData });
  const json = await parseJsonResponse(res);
  return json.data;
}

function mediaBaseUrl() {
  return API.replace(/\/api\/v1\/?$/, "");
}

export function resolveMediaUrl(url) {
  if (!url) return null;
  if (typeof url === "object" && url.src) return url.src;
  if (String(url).startsWith("http") || String(url).startsWith("blob:")) return String(url);
  return `${mediaBaseUrl()}${String(url).startsWith("/") ? url : `/${url}`}`;
}


function authHeaders() {
  const token = getJSON(SESSION_KEY, null)?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function qs(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "" && v !== "all") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

const positionById = (id) => ALL_POSITIONS.find((p) => p.id === id);

function pickLocalized(obj, field = "fr") {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[field] || obj.fr || obj.en || "";
}

async function hydrateCandidate(id) {
  if (!id) return null;
  try {
    const raw = await api(`/candidates/${id}`);
    return mapCandidate(raw);
  } catch {
    return null;
  }
}

function mapCandidate(raw) {
  if (!raw) return null;
  const pos = positionById(raw.positionId);
  const name = raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
  const about = raw.about;
  const mapped = {
    ...raw,
    id: raw.id || raw._id,
    name,
    photo: resolveMediaUrl(raw.photoUrl || raw.photo) || PLACEHOLDER_PHOTO,
    title: raw.title || pos?.fr || raw.positionId || "",
    titleAr: raw.titleAr || pos?.ar || "",
    titleEn: raw.titleEn || pos?.en || "",
    completion: raw.completion ?? raw.completionPercent ?? 0,
    about: typeof about === "string" ? about : pickLocalized(about, "fr"),
    aboutAr: typeof about === "object" ? pickLocalized(about, "ar") : raw.aboutAr || "",
    aboutEn: typeof about === "object" ? pickLocalized(about, "en") : raw.aboutEn || "",
    canUploadFoodPhotos: Boolean(pos?.photos),
    // The API returns every dish photo with its moderation state; only approved
    // ones may be shown, or moderation is bypassed on the public profile.
    foodPhotos: Array.isArray(raw.dishPhotos)
      ? raw.dishPhotos
          .filter((p) => p.moderationStatus === "approved")
          .map((p) => resolveMediaUrl(p.url))
          .filter(Boolean)
      : raw.foodPhotos || [],
    hasCv: Boolean(raw.cvAssetId || raw.hasCv),
  };
  if (!mapped.completion && mapped.firstName) {
    mapped.completion = getProfileCompletion(mapped).percent;
  }
  return mapped;
}

const employerCache = new Map();

async function getEmployerCached(id) {
  if (!id) return null;
  if (employerCache.has(id)) return employerCache.get(id);
  try {
    const raw = await api(`/employers/${id}`);
    const mapped = {
      ...raw,
      id: raw.id,
      logo: resolveMediaUrl(raw.logoUrl || raw.logo) || PLACEHOLDER_LOGO,
      cover: resolveMediaUrl(raw.coverUrl || raw.cover) || PLACEHOLDER_LOGO,
      about: typeof raw.about === "string" ? raw.about : pickLocalized(raw.about, "fr"),
      email: raw.email || "",
    };
    employerCache.set(id, mapped);
    return mapped;
  } catch {
    return { id, name: "", logo: PLACEHOLDER_LOGO, type: "restaurant", city: "" };
  }
}

async function mapJob(raw) {
  if (!raw) return null;
  const employer = await getEmployerCached(raw.employerId);
  const title = raw.title;
  const description = raw.description;
  const mapped = {
    ...raw,
    id: raw.id || raw._id,
    title: typeof title === "string" ? title : pickLocalized(title, "fr"),
    titleAr: typeof title === "object" ? pickLocalized(title, "ar") : raw.titleAr || "",
    titleEn: typeof title === "object" ? pickLocalized(title, "en") : raw.titleEn || "",
    description: typeof description === "string" ? description : pickLocalized(description, "fr"),
    descriptionAr: typeof description === "object" ? pickLocalized(description, "ar") : raw.descriptionAr || "",
    descriptionEn: typeof description === "object" ? pickLocalized(description, "en") : raw.descriptionEn || "",
    employerName: employer?.name || raw.employerName || "",
    establishmentType: employer?.type || raw.establishmentType || "",
    logo: employer?.logo || PLACEHOLDER_LOGO,
    applicants: raw.applicationCount ?? raw.applicants ?? 0,
    postedAt: raw.postedAt ? String(raw.postedAt).slice(0, 10) : raw.postedAt,
    expiresAt: raw.expiresAt ? String(raw.expiresAt).slice(0, 10) : raw.expiresAt,
  };
  // API offers run on the real clock; the fixture helpers measure against the
  // demo's frozen "today" and would misreport days left. Unapproved offers have
  // no expiry yet.
  mapped.daysLeft = raw.expiresAt
    ? Math.ceil((new Date(raw.expiresAt).getTime() - Date.now()) / 86400000)
    : null;
  mapped.expired = raw.status === "expired" || (mapped.daysLeft != null && mapped.daysLeft <= 0);
  return mapped;
}

function paginateFromMeta(items, meta, isLoggedIn) {
  const total = meta?.total ?? items.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visiblePages = isLoggedIn ? totalPages : Math.min(totalPages, GUEST_MAX_PAGES);
  const page = meta?.page ?? 1;
  return {
    items,
    page,
    totalPages,
    visiblePages,
    total,
    gated: meta?.gated ?? (!isLoggedIn && totalPages > visiblePages),
  };
}

/* ------------------------------------------------- candidate profile edits */

const PROFILE_EDITS_KEY = "nkhedmou.profileEdits";

const allProfileEdits = () => getJSON(PROFILE_EDITS_KEY, {}) || {};

function withEdits(candidate) {
  if (!candidate) return candidate;
  const patch = allProfileEdits()[candidate.id];
  if (!patch) return candidate;

  const merged = { ...candidate, ...patch };
  return { ...merged, completion: getProfileCompletion(merged).percent };
}

const currentCandidateId = () =>
  getJSON(SESSION_KEY, null)?.user?.id || CURRENT_CANDIDATE_ID;

function paginate(items, page, isLoggedIn) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visiblePages = isLoggedIn ? totalPages : Math.min(totalPages, GUEST_MAX_PAGES);
  const safePage = Math.min(Math.max(1, page), visiblePages);
  const start = (safePage - 1) * PAGE_SIZE;

  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: safePage,
    totalPages,
    visiblePages,
    total: items.length,
    gated: !isLoggedIn && totalPages > visiblePages,
  };
}

/* ------------------------------------------------------------------ jobs */

export async function searchJobs({
  q = "",
  city = "all",
  sectorId = "all",
  positionId = "all",
  contractType = "all",
  establishmentType = "all",
  experience = "all",
  page = 1,
  isLoggedIn = false,
  searchAll = false,
} = {}) {
  if (USE_API) {
    const params = searchAll
      ? { page, limit: PAGE_SIZE }
      : { q, city, sectorId, positionId, contractType, establishmentType, experience, page, limit: PAGE_SIZE };
    const { data, meta } = await apiWithMeta(`/jobs${qs(params)}`);
    const items = await Promise.all((data || []).map(mapJob));
    return paginateFromMeta(items, meta, isLoggedIn);
  }

  await delay();

  const term = q.trim().toLowerCase();
  const results = ACTIVE_JOBS.filter((job) => {
    if (searchAll) return true;
    if (term && !`${job.title} ${job.employerName}`.toLowerCase().includes(term)) return false;
    return (
      matches(job.city, city) &&
      matches(job.sectorId, sectorId) &&
      matches(job.positionId, positionId) &&
      matches(job.contractType, contractType) &&
      matches(job.establishmentType, establishmentType) &&
      matches(job.experience, experience)
    );
  });

  return paginate(results, page, isLoggedIn);
}

export async function fetchJob(id) {
  if (USE_API) {
    try {
      const raw = await api(`/jobs/${id}`);
      return raw ? mapJob(raw) : null;
    } catch (err) {
      // Missing and unpublished offers are 404 for anyone but their owner or an admin.
      if (err.statusCode === 404) return null;
      throw err;
    }
  }

  await delay(150);
  const job = getJob(id);
  return job ? { ...job, daysLeft: daysLeft(job), expired: isExpired(job) } : null;
}

export async function fetchFeaturedJobs(limit = 6) {
  if (USE_API) {
    const data = await api(`/jobs/featured${qs({ limit })}`);
    return Promise.all((data || []).slice(0, limit).map(mapJob));
  }

  await delay(150);
  return ACTIVE_JOBS.slice(0, limit);
}

/* ------------------------------------------------------------ candidates */

export async function searchCandidates({
  q = "",
  city = "all",
  sectorId = "all",
  positionId = "all",
  experience = "all",
  availability = "all",
  page = 1,
  isLoggedIn = false,
  searchAll = false,
} = {}) {
  if (USE_API) {
    const params = searchAll
      ? { page, limit: PAGE_SIZE }
      : { q, city, sectorId, positionId, experience, availability, page, limit: PAGE_SIZE };
    const { data, meta } = await apiWithMeta(`/candidates${qs(params)}`);
    const items = (data || []).map(mapCandidate);
    return paginateFromMeta(items, meta, isLoggedIn);
  }

  await delay();

  const term = q.trim().toLowerCase();
  const results = CANDIDATES.filter((c) => {
    if (searchAll) return true;
    if (term && !`${c.name} ${c.title}`.toLowerCase().includes(term)) return false;
    return (
      matches(c.city, city) &&
      matches(c.sectorId, sectorId) &&
      matches(c.positionId, positionId) &&
      matches(c.experience, experience) &&
      matches(c.availability, availability)
    );
  });

  return paginate(results, page, isLoggedIn);
}

export async function fetchCandidate(id, { asEmployer = false } = {}) {
  if (USE_API) {
    const raw = await api(`/candidates/${id}`);
    const c = mapCandidate(raw);
    if (!c) return null;
    const { phone, ...rest } = c;
    return asEmployer && phone ? { ...rest, phone } : rest;
  }

  await delay(150);
  const c = withEdits(getCandidate(id));
  if (!c) return null;
  const { phone, ...rest } = c;
  return asEmployer ? { ...rest, phone } : rest;
}

export async function fetchCurrentCandidate() {
  if (USE_API) {
    try {
      const raw = await api("/candidates/me");
      return mapCandidate(raw);
    } catch {
      return null;
    }
  }

  await delay(120);
  return withEdits(getCandidate(currentCandidateId()));
}

const hasText = (value) => String(value ?? "").trim() !== "";

// The API's localized fields require non-empty French text, and writing the same
// string into every language would overwrite existing translations.
function toLocalizedPatch(fr, ar, en) {
  if (fr && typeof fr === "object") return fr;
  if (!hasText(fr)) return undefined;
  const out = { fr: String(fr).trim() };
  if (hasText(ar)) out.ar = String(ar).trim();
  if (hasText(en)) out.en = String(en).trim();
  return out;
}

// The edit form always renders one blank row; the API rejects rows with empty
// fields. Fully blank rows are dropped; partly filled ones are sent so the
// validation error reaches the user instead of their data vanishing.
const withoutBlankRows = (rows, keys) =>
  rows?.filter((row) => keys.some((key) => hasText(row?.[key])));

export async function saveCurrentCandidate(patch) {
  if (USE_API) {
    const body = {
      firstName: patch.firstName,
      lastName: patch.lastName,
      sectorId: patch.sectorId,
      positionId: patch.positionId,
      city: patch.city,
      country: patch.country,
      // Enum fields reject "", which is what an untouched select holds.
      experience: patch.experience || undefined,
      availability: patch.availability || undefined,
      contractType: patch.contractType || undefined,
      expectedSalary: patch.expectedSalary === undefined ? undefined : toSalary(patch.expectedSalary),
      phone: patch.phone,
      skills: patch.skills,
      languages: patch.languages,
      training: withoutBlankRows(patch.training, ["school", "diploma", "from", "to"]),
      history: withoutBlankRows(patch.history, ["establishment", "positionId", "from", "to"]),
    };
    const about = toLocalizedPatch(patch.about, patch.aboutAr, patch.aboutEn);
    if (about) body.about = about;
    const raw = await api("/candidates/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapCandidate(raw);
  }

  await delay(180);

  const id = currentCandidateId();
  const edits = allProfileEdits();
  setValue(PROFILE_EDITS_KEY, { ...edits, [id]: { ...(edits[id] || {}), ...patch } });

  return withEdits(getCandidate(id));
}

/* -------------------------------------------------------------- employer */

export async function fetchEmployer(id) {
  if (USE_API) {
    return getEmployerCached(id);
  }

  await delay(120);
  return getEmployer(id);
}

export async function fetchCurrentEmployer() {
  if (USE_API) {
    try {
      const raw = await api("/employers/me");
      return {
        ...raw,
        id: raw.id,
        logo: resolveMediaUrl(raw.logoUrl || raw.logo) || PLACEHOLDER_LOGO,
        cover: resolveMediaUrl(raw.coverUrl || raw.cover) || PLACEHOLDER_LOGO,
        about: typeof raw.about === "string" ? raw.about : pickLocalized(raw.about, "fr"),
        aboutAr: typeof raw.about === "object" ? raw.about?.ar || "" : "",
        aboutEn: typeof raw.about === "object" ? raw.about?.en || "" : "",
      };
    } catch {
      return null;
    }
  }

  await delay(120);
  return getEmployer(CURRENT_EMPLOYER_ID);
}

export async function fetchEmployerJobs(employerId = CURRENT_EMPLOYER_ID) {
  if (USE_API) {
    const grouped = await api("/jobs/me/list");
    const flatten = (arr) => Promise.all((arr || []).map(mapJob));
    const [active, pending, expired, draft, rejected, closed] = await Promise.all([
      flatten(grouped.active),
      flatten(grouped.pending),
      flatten(grouped.expired),
      flatten(grouped.draft),
      flatten(grouped.rejected),
      flatten(grouped.closed),
    ]);
    const all = [...active, ...pending, ...expired, ...draft, ...rejected, ...closed];
    return { all, active, pending, expired };
  }

  await delay(180);
  const all = getJobsByEmployer(employerId).map((j) => ({
    ...j,
    daysLeft: daysLeft(j),
    expired: isExpired(j),
  }));
  return {
    all,
    active: all.filter((j) => j.status === "active" && !j.expired),
    pending: all.filter((j) => j.status === "pending"),
    expired: all.filter((j) => j.status === "expired" || j.expired),
  };
}

export async function fetchEmployerCandidates(employerId = CURRENT_EMPLOYER_ID) {
  if (USE_API) {
    const [applicantsRaw, savedRaw] = await Promise.all([
      api("/applications/received").catch(() => []),
      api("/bookmarks/profiles").catch(() => []),
    ]);

    const applicants = await Promise.all(
      (applicantsRaw || []).map(async (a) => {
        const candRaw = a.candidateId && typeof a.candidateId === "object" ? a.candidateId : null;
        const candidateId = candRaw?.id || candRaw?._id || a.candidateId;
        const candidate = candRaw
          ? mapCandidate(candRaw)
          : await hydrateCandidate(String(candidateId));
        const jobRaw = a.jobId && typeof a.jobId === "object" ? a.jobId : null;
        return {
          ...a,
          id: a.id,
          candidateId: candidate?.id || candidateId,
          jobId: jobRaw?.id || a.jobId,
          jobTitle: jobRaw ? pickLocalized(jobRaw.title, "fr") : a.jobTitle,
          employerId,
          candidate,
          source: "applied",
          appliedAt: a.appliedAt ? String(a.appliedAt).slice(0, 10) : a.appliedAt,
        };
      })
    );

    const saved = await Promise.all(
      (savedRaw || []).map(async (s) => {
        const targetId = s.targetId || s.target?.id || s.target;
        const candidate = await hydrateCandidate(String(targetId));
        return {
          ...s,
          id: s.id,
          candidateId: candidate?.id || targetId,
          employerId,
          candidate,
          source: "saved",
          savedAt: s.createdAt ? String(s.createdAt).slice(0, 10) : s.savedAt,
        };
      })
    );

    return { applicants, saved };
  }

  await delay(200);

  const applicants = APPLICATIONS.filter((a) => a.employerId === employerId).map((a) => ({
    ...a,
    candidate: getCandidate(a.candidateId),
  }));

  const saved = SAVED_PROFILES.filter((s) => s.employerId === employerId).map((s) => ({
    ...s,
    source: "saved",
    candidate: getCandidate(s.candidateId),
  }));

  return { applicants, saved };
}

export async function fetchEmployers() {
  if (USE_API) {
    return [];
  }

  await delay(120);
  return EMPLOYERS;
}

/* ------------------------------------------------ candidate's own account */

export async function fetchMyApplications() {
  if (USE_API) {
    const rows = await api("/applications/me");
    return Promise.all(
      (rows || []).map(async (a) => {
        const jobRaw = a.jobId && typeof a.jobId === "object" ? a.jobId : null;
        const job = jobRaw ? await mapJob(jobRaw) : a.jobId ? await fetchJob(a.jobId) : null;
        return {
          ...a,
          id: a.id,
          jobId: job?.id || a.jobId,
          job,
          appliedAt: a.appliedAt ? String(a.appliedAt).slice(0, 10) : a.appliedAt,
        };
      })
    );
  }

  await delay(180);
  return MY_APPLICATIONS.map((a) => ({ ...a, job: getJob(a.jobId) }));
}

export async function fetchMyStats() {
  if (USE_API) {
    const [profile, applications] = await Promise.all([
      api("/candidates/me").catch(() => null),
      api("/applications/me").catch(() => []),
    ]);
    return {
      views: profile?.profileViews ?? 0,
      applications: (applications || []).length,
      savedByEmployers: 0,
    };
  }

  await delay(150);

  const id = currentCandidateId();
  const index = Math.max(0, CANDIDATES.findIndex((c) => c.id === id));

  return {
    views: 60 + index * 13,
    applications: MY_APPLICATIONS.length,
    savedByEmployers: SAVED_PROFILES.filter((s) => s.candidateId === id).length,
  };
}

/* --------------------------------------------------------- notifications */

export async function fetchNotifications() {
  if (USE_API) {
    const { data } = await apiWithMeta("/notifications");
    return (data || []).map((n) => ({
      id: n.id,
      type: n.type,
      title: pickLocalized(n.title, "fr"),
      titleAr: pickLocalized(n.title, "ar"),
      titleEn: pickLocalized(n.title, "en"),
      body: pickLocalized(n.body, "fr"),
      bodyAr: pickLocalized(n.body, "ar"),
      bodyEn: pickLocalized(n.body, "en"),
      date: n.createdAt ? String(n.createdAt).slice(0, 10) : "",
      read: Boolean(n.read),
    }));
  }

  await delay(120);
  return NOTIFICATIONS;
}

/* ------------------------------------------------------------ mutations */

export async function applyToJob(jobId) {
  if (USE_API) {
    await api("/applications", { method: "POST", body: JSON.stringify({ jobId }) });
    return { ok: true, jobId };
  }

  await delay(400);
  return { ok: true, jobId };
}

const toSalary = (value) => {
  if (value === "" || value == null) return null;
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// The form holds ids and plain strings; the API requires localized title and
// description and integer salaries. The offer title is the chosen position.
function toJobBody(form) {
  const position = positionById(form.positionId);
  return {
    title: { fr: position?.fr || form.positionId, ar: position?.ar || "", en: position?.en || "" },
    description: { fr: String(form.description || "").trim() },
    sectorId: form.sectorId,
    positionId: form.positionId,
    city: form.city,
    contractType: form.contractType,
    experience: form.experience,
    salaryMin: toSalary(form.salaryMin),
    salaryMax: toSalary(form.salaryMax),
    requirements: form.requirements || [],
    benefits: form.benefits || [],
  };
}

export async function postJob(payload) {
  if (USE_API) {
    const job = await api("/jobs", { method: "POST", body: JSON.stringify(toJobBody(payload)) });
    return { ok: true, status: job?.status || "pending", message: "offer.pendingApproval", payload };
  }

  await delay(600);
  return { ok: true, status: "pending", message: "offer.pendingApproval", payload };
}

export async function republishJob(jobId) {
  if (USE_API) {
    await api(`/jobs/${jobId}/republish`, { method: "POST" });
    return { ok: true, jobId, status: "pending" };
  }

  await delay(400);
  return { ok: true, jobId, status: "pending" };
}

export async function toggleSaveProfile(candidateId, saved) {
  if (USE_API) {
    if (saved) {
      await api("/bookmarks/profiles", {
        method: "POST",
        body: JSON.stringify({ targetId: candidateId }),
      });
    } else {
      await api(`/bookmarks/profiles${qs({ targetId: candidateId })}`, { method: "DELETE" });
    }
    return { ok: true, candidateId, saved };
  }

  await delay(250);
  return { ok: true, candidateId, saved };
}

export async function submitFeedback(payload) {
  if (USE_API) {
    // The API accepts only { role, rating, message }; the widget and the contact
    // form collect richer fields, so those are folded into the message.
    const message = [
      [payload.firstName, payload.lastName].filter(Boolean).join(" "),
      payload.email,
      payload.phone,
      payload.helpful ? `helpful: ${payload.helpful}` : "",
      payload.message,
      payload.comments,
    ]
      .filter(hasText)
      .map((part) => String(part).trim())
      .join("\n");
    await api("/feedback", {
      method: "POST",
      body: JSON.stringify({
        role: payload.role || getJSON(SESSION_KEY, null)?.role,
        rating: payload.rating,
        message,
      }),
    });
    return { ok: true, payload };
  }

  await delay(400);
  return { ok: true, payload };
}

/* --------------------------------------------------------------- auth */

export async function loginUser({ email, password }) {
  if (USE_API) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { accessToken: data.accessToken, user: data.user };
  }

  await delay(300);
  const err = new Error("Invalid email or password");
  err.statusCode = 401;
  throw err;
}

export async function registerUser({ email, password, role, firstName, lastName, locale, phone }) {
  if (USE_API) {
    const body = { email, password, role, locale, phone };
    await api("/auth/register", { method: "POST", body: JSON.stringify(body) });
    return { ok: true, email, role, firstName, lastName };
  }

  await delay(400);
  return { ok: true, email, role, firstName, lastName };
}

export async function verifyOtp({ email, code }) {
  if (USE_API) {
    await api("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    return { ok: true };
  }

  await delay(300);
  return { ok: true };
}

export async function resendOtp({ email }) {
  if (USE_API) {
    await api("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { ok: true };
  }

  await delay(300);
  return { ok: true };
}

export async function refreshSession() {
  if (USE_API) {
    return { accessToken: await refreshAccessToken() };
  }

  await delay(150);
  return { accessToken: "mock-refreshed" };
}

export async function logoutUser() {
  if (USE_API) {
    await api("/auth/logout", { method: "POST" });
    return { ok: true };
  }

  await delay(120);
  return { ok: true };
}

export async function forgotPassword({ email }) {
  if (USE_API) {
    await api("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { ok: true };
  }

  await delay(300);
  return { ok: true };
}

export async function resetPassword({ email, code, password }) {
  if (USE_API) {
    await api("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    });
    return { ok: true };
  }

  await delay(300);
  return { ok: true };
}

export async function changePassword({ currentPassword, newPassword }) {
  if (USE_API) {
    await api("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { ok: true };
  }

  await delay(300);
  return { ok: true };
}

export async function fetchMe() {
  if (USE_API) {
    return api("/auth/me");
  }

  await delay(120);
  const session = getJSON(SESSION_KEY, null);
  if (!session?.user) return null;
  return {
    user: { id: session.user.id, email: session.user.email, role: session.user.role },
    profile: null,
    completeness: null,
  };
}

/* --------------------------------------------------------- employer patch */

export async function saveCurrentEmployer(patch) {
  if (USE_API) {
    const body = {
      name: patch.name,
      // The type select holds "" until chosen, which the enum rejects.
      type: patch.type || undefined,
      city: patch.city,
      address: patch.address,
      phone: patch.phone,
      phonePublic: patch.phonePublic,
      socials: patch.socials,
      since: patch.since == null ? undefined : String(patch.since),
      staffCount: patch.staffCount == null ? undefined : String(patch.staffCount),
    };
    const about = toLocalizedPatch(patch.about, patch.aboutAr, patch.aboutEn);
    if (about) body.about = about;
    const raw = await api("/employers/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return {
      ...raw,
      id: raw.id,
      logo: resolveMediaUrl(raw.logoUrl || raw.logo) || PLACEHOLDER_LOGO,
      cover: resolveMediaUrl(raw.coverUrl || raw.cover) || PLACEHOLDER_LOGO,
      about: typeof raw.about === "string" ? raw.about : pickLocalized(raw.about, "fr"),
      aboutAr: typeof raw.about === "object" ? raw.about?.ar || "" : "",
      aboutEn: typeof raw.about === "object" ? raw.about?.en || "" : "",
    };
  }

  await delay(180);
  return fetchCurrentEmployer();
}

export async function fetchEmployerDashboard() {
  if (USE_API) {
    return api("/employers/me/dashboard");
  }

  await delay(120);
  return { profileViews: 412 };
}

/* -------------------------------------------------------- file uploads */

export async function uploadCandidatePhoto(file) {
  if (USE_API) {
    const form = new FormData();
    form.append("photo", file);
    const raw = await apiForm("/candidates/me/photo", form);
    // The upload response carries no photoUrl; return none rather than the
    // placeholder so the caller keeps showing the image the user just picked.
    return { ...mapCandidate(raw), photo: resolveMediaUrl(raw.photoUrl) };
  }

  await delay(400);
  return fetchCurrentCandidate();
}

export async function uploadCandidateDishPhotos(files) {
  if (USE_API) {
    const form = new FormData();
    files.forEach((file) => form.append("photos", file));
    const raw = await apiForm("/candidates/me/dish-photos", form);
    const mapped = mapCandidate(raw);
    // Same gap as the profile photo: without dishPhotos in the response, leave
    // the caller's previews in place instead of blanking them.
    return Array.isArray(raw.dishPhotos) ? mapped : { ...mapped, foodPhotos: undefined };
  }

  await delay(400);
  return fetchCurrentCandidate();
}

export async function uploadCandidateCv(file) {
  if (USE_API) {
    const form = new FormData();
    form.append("cv", file);
    const raw = await apiForm("/candidates/me/cv", form);
    return mapCandidate(raw);
  }

  await delay(400);
  return fetchCurrentCandidate();
}

export async function uploadEmployerLogo(file) {
  if (USE_API) {
    const form = new FormData();
    form.append("logo", file);
    const raw = await apiForm("/employers/me/logo", form);
    return {
      ...raw,
      logo: resolveMediaUrl(raw.logoUrl || raw.logo) || PLACEHOLDER_LOGO,
      cover: resolveMediaUrl(raw.coverUrl || raw.cover) || PLACEHOLDER_LOGO,
    };
  }

  await delay(400);
  return fetchCurrentEmployer();
}

export async function uploadEmployerCover(file) {
  if (USE_API) {
    const form = new FormData();
    form.append("cover", file);
    const raw = await apiForm("/employers/me/cover", form);
    return {
      ...raw,
      logo: resolveMediaUrl(raw.logoUrl || raw.logo) || PLACEHOLDER_LOGO,
      cover: resolveMediaUrl(raw.coverUrl || raw.cover) || PLACEHOLDER_LOGO,
    };
  }

  await delay(400);
  return fetchCurrentEmployer();
}

/* --------------------------------------------------- applications / notifications */

export async function updateApplicationStatus(id, status, note) {
  if (USE_API) {
    const body = note ? { status, note } : { status };
    const data = await api(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return data;
  }

  await delay(250);
  return { ok: true, id, status };
}

export async function markNotificationRead(id) {
  if (USE_API) {
    return api(`/notifications/${id}/read`, { method: "PATCH" });
  }

  await delay(120);
  return { ok: true, id };
}

export async function markAllNotificationsRead() {
  if (USE_API) {
    return api("/notifications/read-all", { method: "PATCH" });
  }

  await delay(120);
  return { ok: true };
}

export async function fetchUnreadNotificationCount() {
  if (USE_API) {
    const { data, meta } = await apiWithMeta("/notifications?read=false&limit=1");
    if (typeof meta?.total === "number") return meta.total;
    return (data || []).filter((n) => !n.read).length;
  }

  await delay(80);
  return NOTIFICATIONS.filter((n) => !n.read).length;
}

/* --------------------------------------------------------- public content */

function mapPublicBanner(raw) {
  const imageSrc =
    typeof raw.image === "object" && raw.image?.src
      ? raw.image.src
      : resolveMediaUrl(raw.imageUrl || raw.image) ||
        // A banner without an uploaded image gets a stock photo, not a stretched logo.
        HOME_BANNERS_MIDDLE[0]?.image?.src ||
        PLACEHOLDER_LOGO;
  return {
    id: raw.id,
    title: pickLocalized(raw.title, "fr"),
    titleAr: pickLocalized(raw.title, "ar"),
    titleEn: pickLocalized(raw.title, "en"),
    subtitle: pickLocalized(raw.subtitle, "fr"),
    subtitleAr: pickLocalized(raw.subtitle, "ar"),
    subtitleEn: pickLocalized(raw.subtitle, "en"),
    cta: pickLocalized(raw.cta, "fr"),
    ctaAr: pickLocalized(raw.cta, "ar"),
    ctaEn: pickLocalized(raw.cta, "en"),
    href: raw.href || "#",
    image: { src: imageSrc, focus: raw.image?.focus || "center" },
    bg: raw.theme || "from-slate-900 via-slate-800/85 to-transparent",
  };
}

export async function fetchBanners(placement) {
  if (USE_API) {
    const data = await api(`/banners${qs({ placement })}`);
    return (data || []).map(mapPublicBanner);
  }

  await delay(120);
  if (placement === "home-middle") return HOME_BANNERS_MIDDLE;
  if (placement === "home-bottom") return HOME_BANNERS_BOTTOM;
  if (placement === "sticky") return [STICKY_BANNER];
  return [...HOME_BANNERS_MIDDLE, ...HOME_BANNERS_BOTTOM, STICKY_BANNER];
}

export async function clickBanner(id) {
  if (USE_API) {
    await api(`/banners/${id}/click`, { method: "POST" });
    return { ok: true };
  }

  await delay(80);
  return { ok: true };
}

export async function fetchPartners() {
  if (USE_API) {
    const rows = await api("/partners");
    return (rows || []).map((p) => ({
      id: p.id,
      name: p.name,
      href: p.href || "#",
      logo: resolveMediaUrl(p.logoUrl || p.logo) || null,
      kind: p.kind || "",
      kindAr: p.kindAr || "",
      kindEn: p.kindEn || "",
      city: p.city || "",
      cityAr: p.cityAr || "",
      cityEn: p.cityEn || "",
      color: p.color || "#679046",
      mark: p.mark || "",
    }));
  }

  await delay(120);
  return PARTNERS;
}

export async function fetchSiteSettings() {
  if (USE_API) {
    const settings = await api("/site-settings");
    return {
      ...settings,
      imageUrl: resolveMediaUrl(settings?.imageUrl) || settings?.imageUrl || null,
    };
  }

  await delay(80);
  return {};
}

export async function fetchTaxonomies() {
  if (USE_API) {
    return api("/taxonomies");
  }

  await delay(120);
  return { sectors: SECTORS, positions: POSITIONS };
}

/* -------------------------------------------------------------- bookmarks */

export async function fetchBookmarkJobIds() {
  if (USE_API) {
    const data = await api("/bookmarks/jobs");
    return new Set(
      (data || []).map((b) => String(b.targetId || b.target?.id || b.id))
    );
  }

  await delay(120);
  return new Set();
}

export async function toggleSaveJob(jobId, currentlySaved) {
  if (USE_API) {
    if (currentlySaved) {
      await api(`/bookmarks/jobs${qs({ targetId: jobId })}`, { method: "DELETE" });
    } else {
      await api("/bookmarks/jobs", {
        method: "POST",
        body: JSON.stringify({ targetId: jobId }),
      });
    }
    return { ok: true, jobId, saved: !currentlySaved };
  }

  await delay(250);
  return { ok: true, jobId, saved: !currentlySaved };
}


/* ----------------------------------------------------------- media helpers */

export async function fetchSavedProfileIds() {
  if (USE_API) {
    try {
      const rows = await api("/bookmarks/profiles");
      return new Set(
        (rows || []).map((s) => String(s.targetId || s.target?.id || s.target || "")).filter(Boolean)
      );
    } catch {
      return new Set();
    }
  }

  await delay(80);
  return new Set(SAVED_PROFILES.map((s) => s.candidateId));
}

export async function blobUrlToFile(url, filename = "upload.jpg") {
  const res = await fetch(url);
  const blob = await res.blob();
  const ext = blob.type?.split("/")[1] || "jpg";
  const name = filename.includes(".") ? filename : `${filename}.${ext}`;
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
