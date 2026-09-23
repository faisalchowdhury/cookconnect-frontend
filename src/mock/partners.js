// "They trust us" — the partner strip on the home page.
//
// PLACEHOLDER DATA. Every establishment below is fictional, invented for this
// build in the same way the advertising slots in banners.js invent "ProChef
// Maroc". They are deliberately *not* real hotel or restaurant brands: a strip
// headed "they trust us" is an endorsement claim, and putting a real company's
// mark there states a commercial relationship that does not exist.
//
// To swap in a real partner, replace `mark` with `logo: "/partners/name.svg"`
// and Partners.jsx renders the image instead — see the component for the
// two-line branch that handles it. Names, cities and colours can be edited in
// place; the strip sizes itself to whatever length this array is.
//
// `mark` is a lucide-style stroked path drawn on a 24x24 grid, so the marks
// share the icon language used everywhere else on the site rather than looking
// like ten pasted-in bitmaps of different weights.
//
// `kind` / `city` carry `Ar` variants read by pick(partner, "kind"). The trade
// name itself is never translated — a business is called what it is called in
// every language, which is why only the descriptor line switches script.

export const PARTNERS = [
  {
    id: "riad-al-menzeh",
    name: "Riad Al Menzeh",
    kind: "Hôtellerie",
    kindAr: "الفندقة",
    kindEn: "Hospitality",
    city: "Marrakech",
    cityAr: "مراكش",
    cityEn: "Marrakesh",
    color: "#B8860B",
    // Riad archway.
    mark: "M12 2.5c-3.6 0-6.5 2.9-6.5 6.5v12h13v-12c0-3.6-2.9-6.5-6.5-6.5zM9.5 21v-6a2.5 2.5 0 0 1 5 0v6",
  },
  {
    id: "comptoir-atlas",
    name: "Le Comptoir Atlas",
    kind: "Restaurant",
    kindAr: "ريسطو",
    kindEn: "Restaurant",
    city: "Casablanca",
    cityAr: "كازابلانكا",
    cityEn: "Casablanca",
    color: "#4F6F35",
    // Atlas ridgeline.
    mark: "M2 19.5l6.5-9.5 4 5.5 3-4.5 6.5 8.5zM15.5 11L18 7l2.5 4",
  },
  {
    id: "boulangerie-zohra",
    name: "Boulangerie Zohra",
    kind: "Boulangerie",
    kindAr: "مخبزة",
    kindEn: "Bakery",
    city: "Rabat",
    cityAr: "الرباط",
    cityEn: "Rabat",
    color: "#C2761E",
    // Wheat ear.
    mark: "M12 21V8M12 12c0-2.3 1.5-4 3.8-4.4.4 2.6-1.2 4.4-3.8 4.4zM12 12c0-2.3-1.5-4-3.8-4.4-.4 2.6 1.2 4.4 3.8 4.4zM12 7.5c0-2.3 1.5-4 3.8-4.4.4 2.6-1.2 4.4-3.8 4.4zM12 7.5c0-2.3-1.5-4-3.8-4.4-.4 2.6 1.2 4.4 3.8 4.4z",
  },
  {
    id: "ocean-bleu",
    name: "Océan Bleu",
    kind: "Poissonnerie & Restaurant",
    kindAr: "حوتة وريسطو",
    kindEn: "Seafood & Restaurant",
    city: "Essaouira",
    cityAr: "الصويرة",
    cityEn: "Essaouira",
    color: "#2C6E8F",
    // Three swells.
    mark: "M2 9c2.2-2.6 4.4-2.6 6.7 0 2.2 2.6 4.4 2.6 6.6 0 2.3-2.6 4.5-2.6 6.7 0M2 14c2.2-2.6 4.4-2.6 6.7 0 2.2 2.6 4.4 2.6 6.6 0 2.3-2.6 4.5-2.6 6.7 0M2 19c2.2-2.6 4.4-2.6 6.7 0 2.2 2.6 4.4 2.6 6.6 0 2.3-2.6 4.5-2.6 6.7 0",
  },
  {
    id: "kasbah-palace",
    name: "Kasbah Palace",
    kind: "Hôtellerie",
    kindAr: "الفندقة",
    kindEn: "Hospitality",
    city: "Ouarzazate",
    cityAr: "ورزازات",
    cityEn: "Ouarzazate",
    color: "#A8471A",
    // Crenellated kasbah tower.
    mark: "M4 21V9h2V6.5h2V9h2V6.5h2V9h2V6.5h2V9h2v12zM10 21v-5.5h4V21",
  },
  {
    id: "cafe-andalous",
    name: "Café Andalous",
    kind: "Café",
    kindAr: "قهوة",
    kindEn: "Café",
    city: "Tanger",
    cityAr: "طنجة",
    cityEn: "Tangier",
    color: "#6B4423",
    // Cup and saucer.
    mark: "M4.5 7.5h11v6a5.5 5.5 0 0 1-11 0zM15.5 9h2a2.75 2.75 0 0 1 0 5.5h-2M3 21h14",
  },
  {
    id: "table-zellige",
    name: "Table & Zellige",
    kind: "Restauration collective",
    kindAr: "إطعام جماعي",
    kindEn: "Contract catering",
    city: "Fès",
    cityAr: "فاس",
    cityEn: "Fez",
    color: "#1F6F78",
    // Eight-point zellige star.
    mark: "M12 2.2l2.7 4.3 4.9-1.2-1.2 4.9 4.3 2.7-4.3 2.7 1.2 4.9-4.9-1.2L12 23.8l-2.7-4.5-4.9 1.2 1.2-4.9L1.3 12.9l4.3-2.7-1.2-4.9 4.9 1.2z",
  },
  {
    id: "maison-sahara",
    name: "Maison Sahara",
    kind: "Hôtellerie",
    kindAr: "الفندقة",
    kindEn: "Hospitality",
    city: "Merzouga",
    cityAr: "مرزوكة",
    cityEn: "Merzouga",
    color: "#C08A2E",
    // Sun over dunes.
    mark: "M12 3.5v2M18 6l-1.4 1.4M20.5 12h-2M5.5 12h-2M7.4 7.4L6 6M15.5 12a3.5 3.5 0 1 0-7 0M2 17c3.2-3.8 6.4-3.8 9.6 0M12.4 21c3.2-3.8 6.4-3.8 9.6 0",
  },
  {
    id: "brasserie-majorelle",
    name: "Brasserie Majorelle",
    kind: "Brasserie",
    kindAr: "براسري",
    kindEn: "Brasserie",
    city: "Marrakech",
    cityAr: "مراكش",
    cityEn: "Marrakesh",
    color: "#2F5D8C",
    // Stemmed glass.
    mark: "M7.5 3h9l-1 6.5a3.5 3.5 0 0 1-7 0zM12 13v6M8.5 21h7",
  },
  {
    id: "traiteur-yasmine",
    name: "Traiteur Yasmine",
    kind: "Traiteur",
    kindAr: "تريتور",
    kindEn: "Caterer",
    city: "Agadir",
    cityAr: "أݣادير",
    cityEn: "Agadir",
    color: "#8E3B5E",
    // Serving cloche.
    mark: "M2.5 19h19M4.5 19a7.5 7.5 0 0 1 15 0M12 7.5V5.5M10.5 4h3",
  },
];
