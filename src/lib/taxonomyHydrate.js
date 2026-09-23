import { hydrateSectorsFromApi } from "@/mock/sectors";
import { hydrateCitiesFromApi } from "@/mock/cities";
import { hydrateJobOptionsFromApi } from "@/mock/jobOptions";

export const USE_API = Boolean(process.env.NEXT_PUBLIC_API_URL);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000/api/v1";

export function mapSectorItem(item) {
  return {
    id: item.key,
    fr: item.label?.fr || "",
    ar: item.label?.ar || "",
    en: item.label?.en || "",
  };
}

export function mapPositionItem(item) {
  return {
    id: item.key,
    fr: item.label?.fr || "",
    ar: item.label?.ar || "",
    en: item.label?.en || "",
    photos: Boolean(item.meta?.allowsFoodPhotos),
  };
}

export function mapCityItem(item) {
  return {
    id: item.key,
    fr: item.label?.fr || "",
    ar: item.label?.ar || "",
    en: item.label?.en || "",
  };
}

export function mapFlatOptionItem(item, extra = {}) {
  return {
    id: item.key,
    fr: item.label?.fr || "",
    ar: item.label?.ar || "",
    en: item.label?.en || "",
    ...extra,
  };
}

export async function fetchTaxonomies() {
  if (!USE_API) return null;
  try {
    const res = await fetch(`${API}/taxonomies`, { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) return null;
    return json.data || [];
  } catch {
    return null;
  }
}

/** Fetch taxonomies and hydrate mock stores in place. Returns true when API data applied. */
export async function hydrateTaxonomiesFromApi() {
  const items = await fetchTaxonomies();
  if (!items?.length) return false;

  hydrateSectorsFromApi(items);
  hydrateCitiesFromApi(items);
  hydrateJobOptionsFromApi(items);
  return true;
}
