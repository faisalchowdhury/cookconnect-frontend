// Demo job offers.
//
// Deterministic by design — values are derived from the index, never from
// Math.random() or Date.now() at module scope, so the server and client render
// identical markup and Next.js does not report a hydration mismatch.
//
// Change Requirements 09: an offer lives at most 60 days, then drops off the
// active list but stays in the employer's history and can be republished.

import { EMPLOYERS } from "./employers";
import { POSITIONS } from "./sectors";
import { getCity } from "./cities";

/** Fixed "today" for the demo so expiry maths stay stable between renders. */
export const TODAY = new Date("2026-08-17T00:00:00Z");
export const MAX_OFFER_DAYS = 60;

const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
export const iso = (d) => d.toISOString().slice(0, 10);

const SEED = [
  ["restaurant", "head-chef", "emp-2", "cdi", 12000, 16000, "3-5", 24],
  ["restaurant", "sous-chef", "emp-2", "cdi", 8000, 11000, "3-5", 11],
  ["hotel", "receptionist", "emp-1", "cdi", 5000, 6500, "1-3", 31],
  ["bakery", "pastry-chef", "emp-3", "cdd", 6000, 8000, "1-3", 18],
  ["asian", "sushi-chef", "emp-4", "cdi", 9000, 13000, "3-5", 7],
  ["restaurant", "waiter", "emp-2", "interim", 3500, 4500, "0-1", 42],
  ["hotel", "housekeeper", "emp-6", "cdi", 3500, 4200, "0-1", 27],
  ["restaurant", "pizzaiolo", "emp-2", "cdd", 6500, 8500, "1-3", 15],
  ["bakery", "baker", "emp-3", "cdi", 5500, 7000, "1-3", 22],
  ["restaurant", "barista", "emp-2", "interim", 4000, 5000, "0-1", 19],
  ["hotel", "concierge", "emp-1", "cdi", 6000, 7500, "3-5", 9],
  ["asian", "asian-cook", "emp-4", "cdd", 7000, 9000, "1-3", 13],
  ["restaurant", "kitchen-commis", "emp-5", "stage", 4000, 5200, "0-1", 38],
  ["hotel", "front-office-manager", "emp-6", "cdi", 11000, 14000, "5-10", 6],
  ["bakery", "head-baker", "emp-3", "cdi", 9000, 12000, "5-10", 8],
  ["restaurant", "chef-de-partie", "emp-5", "cdd", 7000, 9500, "3-5", 16],
  ["hotel", "security-guard", "emp-1", "unspecified", 3200, 4000, "0-1", 29],
  ["asian", "teppanyaki-chef", "emp-4", "cdi", 10000, 14000, "5-10", 4],
  ["restaurant", "dishwasher", "emp-5", "interim", 3000, 3500, "0-1", 51],
  ["bakery", "chocolatier", "emp-3", "cdi", 7500, 9500, "3-5", 12],
  ["hotel", "guest-relations", "emp-6", "cdd", 6500, 8000, "1-3", 21],
  ["restaurant", "cook", "emp-2", "cdi", 5500, 7000, "1-3", 33],
  ["restaurant", "barman", "emp-2", "interim", 4500, 5500, "1-3", 17],
  ["hotel", "hotel-director", "emp-1", "cdi", 25000, 35000, "10+", 3],
  ["bakery", "viennoisier", "emp-3", "cdd", 6000, 7500, "1-3", 10],
  ["asian", "sushi-commis", "emp-4", "stage", 4500, 6000, "0-1", 14],
  ["restaurant", "restaurant-manager", "emp-5", "cdi", 14000, 18000, "5-10", 5],
  ["hotel", "gardener", "emp-6", "unspecified", 3200, 3800, "0-1", 25],
  ["restaurant", "delivery-driver", "emp-2", "interim", 3500, 4500, "0-1", 47],
  ["bakery", "salesperson", "emp-3", "cdd", 3000, 3800, "0-1", 36],
];

const REQ_POOL = [
  ["immediate", "moroccan-cuisine", "haccp", "french"],
  ["morning", "international-cuisine", "food-hygiene", "french", "arabic"],
  ["evening", "diploma", "uniform", "french", "english"],
  ["weekends", "hotel-experience", "haccp", "driving-licence", "french"],
  ["immediate", "management", "food-hygiene", "geographic-mobility", "french", "english"],
];

const BEN_POOL = [
  ["fixed-salary", "cnss", "meals", "uniform-provided"],
  ["fixed-salary", "bonuses", "cnss", "health-insurance", "meals", "paid-leave"],
  ["fixed-salary", "tips", "contract", "transport-allowance"],
  ["fixed-salary", "paid-overtime", "cnss", "meals", "transport", "accommodation"],
  ["fixed-salary", "bonuses", "contract", "meals", "uniform-provided", "paid-leave"],
];

const positionOf = (sectorId, positionId) =>
  POSITIONS[sectorId].find((p) => p.id === positionId);

/**
 * Status distribution across the demo set:
 *  - index % 10 === 7  -> pending admin approval (Change Requirements 08)
 *  - index % 10 === 8  -> expired past 60 days   (Change Requirements 09)
 *  - everything else   -> active
 */
const statusFor = (i) => (i % 10 === 7 ? "pending" : i % 10 === 8 ? "expired" : "active");

export const JOBS = SEED.map(
  ([sectorId, positionId, employerId, contractType, salaryMin, salaryMax, experience, applicants], i) => {
    const employer = EMPLOYERS.find((e) => e.id === employerId);
    const position = positionOf(sectorId, positionId);
    const status = statusFor(i);

    // Active offers were posted 1-40 days ago; expired ones over 60 days ago.
    const ageDays = status === "expired" ? 62 + (i % 20) : 1 + ((i * 7) % 40);
    const postedAt = addDays(TODAY, -ageDays);
    const expiresAt = addDays(postedAt, MAX_OFFER_DAYS);

    return {
      id: `job-${i + 1}`,
      sectorId,
      positionId,
      title: position.fr,
      titleAr: position.ar,
      titleEn: position.en,
      employerId,
      employerName: employer.name,
      establishmentType: employer.type,
      logo: employer.logo,
      city: employer.city,
      country: "MA",
      contractType,
      salaryMin,
      salaryMax,
      currency: "MAD",
      experience,
      requirements: REQ_POOL[i % REQ_POOL.length],
      benefits: BEN_POOL[i % BEN_POOL.length],
      description: `${employer.name} recrute un(e) ${position.fr} pour renforcer son équipe. Poste basé à ${getCity(employer.city)?.fr}, prise de fonction rapide, équipe jeune et cadre de travail structuré.`,
      descriptionAr: `${employer.name} كترّيكريطي ${position.ar} باش يقوّي الفريق ديالها. الخدمة ف${getCity(employer.city)?.ar}، البداية قريبة والجو ديال الخدمة مزيان.`,
      descriptionEn: `${employer.name} is hiring a ${position.en} to strengthen its team. Based in ${getCity(employer.city)?.en}, quick start, young team and a well-structured working environment.`,
      status,
      applicants,
      postedAt: iso(postedAt),
      expiresAt: iso(expiresAt),
    };
  }
);

/** Whole days until an offer expires; negative once past its 60-day deadline. */
export const daysLeft = (job) =>
  Math.ceil((new Date(job.expiresAt).getTime() - TODAY.getTime()) / 86400000);

export const isExpired = (job) => daysLeft(job) <= 0;

/** Only approved, in-date offers ever reach the public listing. */
export const ACTIVE_JOBS = JOBS.filter((j) => j.status === "active" && !isExpired(j));

export const getJob = (id) => JOBS.find((j) => j.id === id) || null;

export const getJobsByEmployer = (employerId) =>
  JOBS.filter((j) => j.employerId === employerId);
