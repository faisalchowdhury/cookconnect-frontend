// Admin data.
//
// Statistics are derived from the same fixtures the public site uses, so the
// dashboard never contradicts what the rest of the app shows.
//
// Sources: ClientDoc sections 13-19 and Change Requirements section 11.

import { CANDIDATES } from "./candidates";
import { EMPLOYERS } from "./employers";
import { JOBS, daysLeft, isExpired, TODAY } from "./jobs";
import { APPLICATIONS } from "./applications";

const daysAgo = (isoDate) =>
  Math.floor((TODAY.getTime() - new Date(isoDate).getTime()) / 86400000);

/* ------------------------------------------------ candidate statistics */
// ClientDoc 13: total, new today/week/month, active, 100% complete, verified,
// available immediately.

export const candidateStats = () => {
  const registered = (d) => CANDIDATES.filter((c) => daysAgo(c.registeredAt) <= d).length;
  return {
    total: CANDIDATES.length,
    newToday: registered(0),
    newThisWeek: registered(7),
    newThisMonth: registered(30),
    active: CANDIDATES.filter((c) => c.verified).length,
    complete: CANDIDATES.filter((c) => c.completion === 100).length,
    verified: CANDIDATES.filter((c) => c.verified).length,
    availableNow: CANDIDATES.filter((c) => c.availability === "immediate").length,
  };
};

/* ------------------------------------------------- employer statistics */
// ClientDoc 13: totals, new, verified, awaiting verification, blocked, active,
// and a breakdown by establishment type.

export const employerStats = () => ({
  total: EMPLOYERS.length,
  verified: EMPLOYERS.filter((e) => e.verified).length,
  pending: EMPLOYERS.filter((e) => !e.verified).length,
  blocked: 0,
  active: EMPLOYERS.filter((e) => JOBS.some((j) => j.employerId === e.id)).length,
  byType: EMPLOYERS.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {}),
});

/* ------------------------------------------------ job offer statistics */
// ClientDoc 13: active, published today/month, expiring within 7 days, expired,
// closed, awaiting approval, reported.

export const offerStats = () => {
  const published = (d) => JOBS.filter((j) => daysAgo(j.postedAt) <= d).length;
  return {
    active: JOBS.filter((j) => j.status === "active" && !isExpired(j)).length,
    postedToday: published(0),
    postedThisMonth: published(30),
    expiringSoon: JOBS.filter((j) => {
      const left = daysLeft(j);
      return j.status === "active" && left > 0 && left <= 7;
    }).length,
    expired: JOBS.filter((j) => isExpired(j)).length,
    closed: 0,
    pendingApproval: JOBS.filter((j) => j.status === "pending").length,
    reported: REPORTED_OFFERS.length,
  };
};

/* ---------------------------------------- platform / market statistics */
// ClientDoc 16: most searched job titles, most searched cities, average salary.

export const MOST_SEARCHED_TITLES = [
  { id: "cook", fr: "Cuisinier", ar: "طباخ", en: "Cook", count: 1840 },
  { id: "waiter", fr: "Serveur", ar: "سيرفور", en: "Waiter", count: 1512 },
  { id: "head-chef", fr: "Chef de cuisine", ar: "شيف دكوزينة", en: "Head Chef", count: 1233 },
  { id: "receptionist", fr: "Réceptionniste", ar: "ريسبسيونيست", en: "Receptionist", count: 987 },
  { id: "pastry-chef", fr: "Pâtissier", ar: "باتيسيي", en: "Pastry Chef", count: 764 },
  { id: "barista", fr: "Barista", ar: "باريستا", en: "Barista", count: 611 },
];

export const MOST_SEARCHED_CITIES = [
  { id: "casablanca", fr: "Casablanca", ar: "الدار البيضاء", en: "Casablanca", count: 3120 },
  { id: "marrakech", fr: "Marrakech", ar: "مراكش", en: "Marrakesh", count: 2415 },
  { id: "rabat", fr: "Rabat", ar: "الرباط", en: "Rabat", count: 1880 },
  { id: "tanger", fr: "Tanger", ar: "طنجة", en: "Tangier", count: 1344 },
  { id: "agadir", fr: "Agadir", ar: "أݣادير", en: "Agadir", count: 1102 },
];

export const averageSalary = () => {
  const active = JOBS.filter((j) => j.status === "active");
  const sum = active.reduce((acc, j) => acc + (j.salaryMin + j.salaryMax) / 2, 0);
  return Math.round(sum / active.length);
};

/* ------------------------------------------------------ photo moderation */
// ClientDoc 16 + Change Requirements 11: admin approves or removes photos and
// can block users who repeatedly upload abusive content.

export const PENDING_PHOTOS = [
  { id: "ph-1", candidateId: "cand-3", url: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png", type: "profile", uploadedAt: "2026-08-16", reports: 0 },
  { id: "ph-2", candidateId: "cand-5", url: "https://i.ibb.co/9kBThpjC/Rectangle-118.png", type: "food", uploadedAt: "2026-08-16", reports: 2 },
  { id: "ph-3", candidateId: "cand-9", url: "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png", type: "food", uploadedAt: "2026-08-15", reports: 0 },
  { id: "ph-4", candidateId: "cand-12", url: "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png", type: "profile", uploadedAt: "2026-08-15", reports: 1 },
  { id: "ph-5", candidateId: "cand-17", url: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png", type: "food", uploadedAt: "2026-08-14", reports: 0 },
  { id: "ph-6", candidateId: "cand-21", url: "https://i.ibb.co/9kBThpjC/Rectangle-118.png", type: "food", uploadedAt: "2026-08-14", reports: 3 },
];

export const REPORTED_OFFERS = [
  { id: "rep-1", jobId: "job-19", reason: "Salaire non conforme", reportedAt: "2026-08-15", reports: 2 },
];

/* ------------------------------------------------------- activity log */
// ClientDoc 20: keep a history of admin actions, employer access to candidate
// contact details, and photo upload events.
//
// `detail` is a system-generated label, so it carries translations. `actor` and
// `target` are names — of a person, an establishment or a record — and are left
// as authored; only the administrator role names translate.

export const ACTIVITY_LOG = [
  { id: "log-1", type: "contact-access", actor: "La Table Casablancaise", target: "Youssef El Amrani", detail: "Consultation des coordonnées", detailAr: "الاطلاع على معلومات التواصل", detailEn: "Contact details viewed", at: "2026-08-17 09:12" },
  { id: "log-2", type: "admin", actor: "Admin principal", actorAr: "الأدمين الرئيسي", actorEn: "Main administrator", target: "job-8", detail: "Offre approuvée", detailAr: "العرض تصادق عليه", detailEn: "Offer approved", at: "2026-08-17 08:55" },
  { id: "log-3", type: "photo", actor: "Fatima Bennani", target: "cand-2", detail: "3 photos de préparations importées", detailAr: "3 تصاور ديال التحضيرات تزادو", detailEn: "3 preparation photos uploaded", at: "2026-08-17 08:40" },
  { id: "log-4", type: "contact-access", actor: "Riad Dar Zaman", target: "Salma Idrissi", detail: "Consultation des coordonnées", detailAr: "الاطلاع على معلومات التواصل", detailEn: "Contact details viewed", at: "2026-08-16 17:22" },
  { id: "log-5", type: "admin", actor: "Sous-admin — Modération", actorAr: "أدمين مساعد — المراقبة", actorEn: "Sub-admin — Moderation", target: "ph-2", detail: "Photo refusée (contenu inapproprié)", detailAr: "التصويرة مرفوضة (محتوى ماشي مناسب)", detailEn: "Photo rejected (inappropriate content)", at: "2026-08-16 16:03" },
  { id: "log-6", type: "admin", actor: "Admin principal", actorAr: "الأدمين الرئيسي", actorEn: "Main administrator", target: "cand-14", detail: "Profil vérifié", detailAr: "البروفيل متحقّق منو", detailEn: "Profile verified", at: "2026-08-16 14:47" },
  { id: "log-7", type: "photo", actor: "Mehdi Tazi", target: "cand-5", detail: "Photo de profil importée", detailAr: "تصويرة البروفيل تزادت", detailEn: "Profile photo uploaded", at: "2026-08-16 11:31" },
  { id: "log-8", type: "contact-access", actor: "Sakura Sushi Bar", target: "Hamza Alaoui", detail: "Consultation des coordonnées", detailAr: "الاطلاع على معلومات التواصل", detailEn: "Contact details viewed", at: "2026-08-15 15:09" },
  { id: "log-9", type: "admin", actor: "Admin principal", actorAr: "الأدمين الرئيسي", actorEn: "Main administrator", target: "emp-4", detail: "Employeur en attente de vérification", detailAr: "مشغّل فانتظار التحقق", detailEn: "Employer awaiting verification", at: "2026-08-15 10:18" },
  { id: "log-10", type: "admin", actor: "Sous-admin — Offres", actorAr: "أدمين مساعد — العروض", actorEn: "Sub-admin — Offers", target: "job-18", detail: "Offre rejetée (description incomplète)", detailAr: "العرض مرفوض (الوصف ناقص)", detailEn: "Offer rejected (incomplete description)", at: "2026-08-14 18:02" },
];

/* --------------------------------------------------------- user feedback */
// ClientDoc 19: admin replies, and the user is notified in-app and by email.

export const FEEDBACK = [
  { id: "fb-1", from: "Youssef El Amrani", role: "candidate", rating: 4, message: "La plateforme est claire, mais j'aimerais pouvoir filtrer par quartier à Casablanca.", at: "2026-08-16", reply: null },
  { id: "fb-2", from: "Riad Dar Zaman", role: "employer", rating: 5, message: "Très pratique pour trouver du personnel de salle rapidement. Merci !", at: "2026-08-15", reply: "Merci pour votre retour, ravi que la plateforme vous soit utile." },
  { id: "fb-3", from: "Nadia Chraibi", role: "candidate", rating: 2, message: "Je n'arrive pas à importer mon CV, le fichier est refusé.", at: "2026-08-14", reply: null },
  { id: "fb-4", from: "Boulangerie Al Manar", role: "employer", rating: 4, message: "Serait-il possible de publier plusieurs offres en une seule fois ?", at: "2026-08-12", reply: null },
  { id: "fb-5", from: "Karim Ouazzani", role: "candidate", rating: 5, message: "J'ai trouvé un poste en deux semaines. Merci beaucoup.", at: "2026-08-10", reply: "Félicitations ! Nous sommes très heureux pour vous." },
];

/* --------------------------------------------------- admin roles & rights */
// ClientDoc 18: the main admin creates internal admins with restricted rights,
// e.g. one who may only approve photos and offers.

export const PERMISSIONS = [
  { id: "approve-offers", fr: "Approuver les offres", ar: "المصادقة على العروض", en: "Approve offers" },
  { id: "approve-photos", fr: "Modérer les photos", ar: "مراقبة التصاور", en: "Moderate photos" },
  { id: "manage-candidates", fr: "Gérer les candidats", ar: "تدبير المترشحين", en: "Manage candidates" },
  { id: "manage-employers", fr: "Gérer les employeurs", ar: "تدبير المشغّلين", en: "Manage employers" },
  { id: "export-cv", fr: "Exporter la base CV", ar: "تصدير قاعدة السي في", en: "Export CV database" },
  { id: "manage-banners", fr: "Gérer les bannières", ar: "تدبير البانيرات", en: "Manage banners" },
  { id: "delete-users", fr: "Supprimer des comptes", ar: "حذف الحسابات", en: "Delete accounts" },
  { id: "manage-admins", fr: "Gérer les administrateurs", ar: "تدبير الإداريين", en: "Manage administrators" },
];

export const ADMINS = [
  {
    id: "adm-1",
    name: "Admin principal",
    email: "admin@nkhedmou.ma",
    role: "super",
    permissions: PERMISSIONS.map((p) => p.id),
    lastActive: "2026-08-17 09:12",
  },
  {
    id: "adm-2",
    name: "Sous-admin — Modération",
    email: "moderation@nkhedmou.ma",
    role: "sub",
    permissions: ["approve-photos"],
    lastActive: "2026-08-16 16:03",
  },
  {
    id: "adm-3",
    name: "Sous-admin — Offres",
    email: "offres@nkhedmou.ma",
    role: "sub",
    permissions: ["approve-offers", "manage-employers"],
    lastActive: "2026-08-14 18:02",
  },
];

/* ---------------------------------------------- employer activity summary */
// ClientDoc 15: per-employer counts, so admin can see who is actually posting
// and who is only harvesting contact details.

export const employerActivity = () =>
  EMPLOYERS.map((e) => {
    const jobs = JOBS.filter((j) => j.employerId === e.id);
    return {
      ...e,
      offersPublished: jobs.length,
      offersActive: jobs.filter((j) => j.status === "active" && !isExpired(j)).length,
      applicationsReceived: APPLICATIONS.filter((a) => a.employerId === e.id).length,
      profilesViewed: 40 + jobs.length * 17,
      contactRequests: ACTIVITY_LOG.filter(
        (l) => l.type === "contact-access" && l.actor === e.name
      ).length,
      lastActivity: jobs.length ? jobs[0].postedAt : "—",
    };
  });
