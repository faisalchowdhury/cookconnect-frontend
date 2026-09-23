// Change Requirements 07 "Country Lock": country is fixed to Morocco while
// Morocco is the primary market; only city-level filtering is offered.

export const COUNTRY = { id: "MA", fr: "Maroc", ar: "المغرب", en: "Morocco" };

export const CITIES = [
  { id: "casablanca", fr: "Casablanca", ar: "الدار البيضاء", en: "Casablanca" },
  { id: "rabat", fr: "Rabat", ar: "الرباط", en: "Rabat" },
  { id: "marrakech", fr: "Marrakech", ar: "مراكش", en: "Marrakesh" },
  { id: "fes", fr: "Fès", ar: "فاس", en: "Fez" },
  { id: "tanger", fr: "Tanger", ar: "طنجة", en: "Tangier" },
  { id: "agadir", fr: "Agadir", ar: "أݣادير", en: "Agadir" },
  { id: "meknes", fr: "Meknès", ar: "مكناس", en: "Meknes" },
  { id: "oujda", fr: "Oujda", ar: "وجدة", en: "Oujda" },
  { id: "kenitra", fr: "Kénitra", ar: "القنيطرة", en: "Kenitra" },
  { id: "tetouan", fr: "Tétouan", ar: "تطوان", en: "Tetouan" },
  { id: "essaouira", fr: "Essaouira", ar: "الصويرة", en: "Essaouira" },
  { id: "eljadida", fr: "El Jadida", ar: "الجديدة", en: "El Jadida" },
  { id: "nador", fr: "Nador", ar: "الناظور", en: "Nador" },
  { id: "ouarzazate", fr: "Ouarzazate", ar: "ورزازات", en: "Ouarzazate" },
  { id: "dakhla", fr: "Dakhla", ar: "الداخلة", en: "Dakhla" },
];

export const getCity = (id) => CITIES.find((c) => c.id === id) || null;

/** Merge or replace city list from API taxonomy items (in place). */
export function hydrateCitiesFromApi(items) {
  const cities = items
    .filter((item) => item.type === "city")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!cities.length) return;

  const mapped = cities.map((c) => ({
    id: c.key,
    fr: c.label?.fr || "",
    ar: c.label?.ar || "",
    en: c.label?.en || "",
  }));

  const apiKeys = new Set(mapped.map((c) => c.id));
  const kept = CITIES.filter((c) => !apiKeys.has(c.id));
  CITIES.splice(0, CITIES.length, ...mapped, ...kept);
}
