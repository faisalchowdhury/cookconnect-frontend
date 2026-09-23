// Sector -> job position taxonomy.
// Source: ClientDoc section 5 (candidate job categories), confirmed by
// Change Requirements section 06 "Sector -> Job Position Flow":
// a position can never be picked before its sector.

export const SECTORS = [
  { id: "hotel", fr: "Hôtellerie", ar: "الفندقة", en: "Hospitality" },
  { id: "restaurant", fr: "Restaurant / Café / Restauration collective", ar: "ريسطو / قهوة / إطعام جماعي", en: "Restaurant / Café / Contract catering" },
  { id: "bakery", fr: "Boulangerie / Pâtisserie", ar: "مخبزة / حلويات", en: "Bakery / Pastry" },
  { id: "asian", fr: "Cuisine asiatique", ar: "الطبخ الآسيوي", en: "Asian cuisine" },
];

// Positions keyed by sector id. `photos: true` marks the kitchen / bakery /
// pastry roles from ClientDoc section 4 that may upload food photos.
export const POSITIONS = {
  restaurant: [
    { id: "executive-chef", fr: "Chef exécutif", ar: "شيف تنفيذي", en: "Executive Chef", photos: true },
    { id: "head-chef", fr: "Chef de cuisine", ar: "شيف دكوزينة", en: "Head Chef", photos: true },
    { id: "sous-chef", fr: "Sous-chef", ar: "سو شيف", en: "Sous Chef", photos: true },
    { id: "chef-de-partie", fr: "Chef de partie", ar: "شيف دي بارتي", en: "Chef de Partie", photos: true },
    { id: "garde-manger", fr: "Chef garde-manger", ar: "شيف كارد مانجي", en: "Garde Manger Chef", photos: true },
    { id: "demi-chef-de-partie", fr: "Demi-chef de partie", ar: "دمي شيف دي بارتي", en: "Demi Chef de Partie", photos: true },
    { id: "cook", fr: "Cuisinier", ar: "طباخ", en: "Cook", photos: true },
    { id: "kitchen-commis", fr: "Commis de cuisine", ar: "كومي دكوزينة", en: "Kitchen Commis", photos: true },
    { id: "sushiman", fr: "Sushiman / Chef sushi", ar: "سوشيمان / شيف سوشي", en: "Sushiman / Sushi Chef", photos: true },
    { id: "apprentice", fr: "Apprenti / Stagiaire", ar: "متمرن / ستاجير", en: "Apprentice / Trainee", photos: true },
    { id: "dishwasher", fr: "Plongeur", ar: "بلونجور", en: "Dishwasher" },
    { id: "cleaning-worker", fr: "Agent d'entretien / de nettoyage", ar: "عامل النظافة", en: "Cleaning Operative" },
    { id: "chef-de-rang", fr: "Chef de rang", ar: "شيف دي رون", en: "Chef de Rang", photos: true },
    { id: "delivery-driver", fr: "Livreur", ar: "ليفرور", en: "Delivery Driver", photos: true },
    { id: "cashier", fr: "Caissier", ar: "كيسيي", en: "Cashier" },
    { id: "pizzaiolo", fr: "Pizzaïolo", ar: "بيتزايولو", en: "Pizzaiolo", photos: true },
    { id: "barman", fr: "Barman / Barmaid", ar: "بارمان / بارميد", en: "Barman / Barmaid", photos: true },
    { id: "barista", fr: "Barista", ar: "باريستا", en: "Barista", photos: true },
    { id: "waiter", fr: "Serveur", ar: "سيرفور", en: "Waiter" },
    { id: "restaurant-manager", fr: "Directeur de site / Responsable de restaurant", ar: "مسؤول الريسطو", en: "Restaurant Manager" },
    { id: "storekeeper", fr: "Magasinier / Gestionnaire de stock", ar: "ماغازينيي", en: "Storekeeper / Stock Controller" },
    { id: "valet", fr: "Voiturier", ar: "فواتوريي", en: "Valet Parker" },
  ],
  hotel: [
    { id: "hotel-director", fr: "Directeur d'hôtel", ar: "مدير الأوطيل", en: "Hotel Director" },
    { id: "guest-relations", fr: "Relations clients / Service client", ar: "خدمة الزبناء", en: "Guest Relations" },
    { id: "front-office-manager", fr: "Chef de réception", ar: "شيف دي ريسبسيون", en: "Front Office Manager" },
    { id: "receptionist", fr: "Réceptionniste", ar: "ريسبسيونيست", en: "Receptionist" },
    { id: "bellman", fr: "Bagagiste / Portier", ar: "باݣاجيست", en: "Bellman / Porter" },
    { id: "concierge", fr: "Concierge", ar: "كونسييرج", en: "Concierge" },
    { id: "housekeeper", fr: "Femme / Valet de chambre", ar: "خدامة الشومبرات", en: "Housekeeper" },
    { id: "linen-attendant", fr: "Lingère", ar: "لانجيرة", en: "Linen Attendant" },
    { id: "hotel-valet", fr: "Voiturier", ar: "فواتوريي", en: "Valet Parker" },
    { id: "cleaning-agent", fr: "Agent de nettoyage", ar: "عامل النظافة", en: "Cleaning Attendant" },
    { id: "gardener", fr: "Jardinier", ar: "جاردينيي", en: "Gardener" },
    { id: "security-guard", fr: "Agent de sécurité", ar: "عسّاس", en: "Security Guard" },
  ],
  bakery: [
    { id: "head-baker", fr: "Chef boulanger", ar: "شيف بولانجي", en: "Head Baker", photos: true },
    { id: "head-pastry-chef", fr: "Chef pâtissier", ar: "شيف باتيسيي", en: "Head Pastry Chef", photos: true },
    { id: "baker", fr: "Boulanger", ar: "خباز", en: "Baker", photos: true },
    { id: "pastry-chef", fr: "Pâtissier", ar: "باتيسيي", en: "Pastry Chef", photos: true },
    { id: "baker-assistant", fr: "Aide-boulanger", ar: "معاون الخباز", en: "Baker's Assistant", photos: true },
    { id: "pastry-assistant", fr: "Aide-pâtissier", ar: "معاون الباتيسيي", en: "Pastry Assistant", photos: true },
    { id: "baker-apprentice", fr: "Apprenti boulanger", ar: "متمرن خباز", en: "Baker Apprentice", photos: true },
    { id: "pastry-apprentice", fr: "Apprenti pâtissier", ar: "متمرن باتيسيي", en: "Pastry Apprentice", photos: true },
    { id: "salesperson", fr: "Vendeur", ar: "بايع", en: "Sales Assistant" },
    { id: "viennoisier", fr: "Viennoisier", ar: "فيينوازيي", en: "Viennoiserie Baker", photos: true },
    { id: "chocolatier", fr: "Chocolatier", ar: "شوكولاتيي", en: "Chocolatier", photos: true },
    { id: "ice-cream-maker", fr: "Glacier", ar: "ݣلاسيي", en: "Ice Cream Maker", photos: true },
    { id: "production-manager", fr: "Responsable de production", ar: "مسؤول الإنتاج", en: "Production Manager" },
    { id: "boutique-manager", fr: "Responsable de boutique", ar: "مسؤول المحل", en: "Shop Manager" },
  ],
  asian: [
    { id: "asian-chef", fr: "Chef de cuisine asiatique", ar: "شيف طبخ آسيوي", en: "Asian Head Chef", photos: true },
    { id: "asian-sous-chef", fr: "Sous-chef de cuisine asiatique", ar: "سو شيف آسيوي", en: "Asian Sous Chef", photos: true },
    { id: "asian-chef-de-partie", fr: "Chef de partie cuisine asiatique", ar: "شيف دي بارتي آسيوي", en: "Asian Chef de Partie", photos: true },
    { id: "asian-cook", fr: "Cuisinier asiatique", ar: "طباخ آسيوي", en: "Asian Cook", photos: true },
    { id: "asian-kitchen-commis", fr: "Commis de cuisine asiatique", ar: "كومي آسيوي", en: "Asian Kitchen Commis", photos: true },
    { id: "sushi-chef", fr: "Chef sushi", ar: "شيف سوشي", en: "Sushi Chef", photos: true },
    { id: "sushiwoman", fr: "Sushiman / Sushiwoman", ar: "سوشيمان / سوشيومان", en: "Sushiwoman", photos: true },
    { id: "sushi-commis", fr: "Commis sushi", ar: "كومي سوشي", en: "Sushi Commis", photos: true },
    { id: "teppanyaki-chef", fr: "Chef teppanyaki", ar: "شيف تيبانياكي", en: "Teppanyaki Chef", photos: true },
    { id: "teppanyaki-cook", fr: "Cuisinier teppanyaki", ar: "طباخ تيبانياكي", en: "Teppanyaki Cook", photos: true },
    { id: "sushi-preparer", fr: "Préparateur sushi", ar: "محضّر السوشي", en: "Sushi Preparer", photos: true },
  ],
};

/** Max food photos per profile — ClientDoc section 4 ("6 for example or 8"). */
export const MAX_FOOD_PHOTOS = 8;

export const getPositions = (sectorId) => POSITIONS[sectorId] || [];

export const getPosition = (sectorId, positionId) =>
  getPositions(sectorId).find((p) => p.id === positionId) || null;

/** Only kitchen / bakery / pastry / Asian roles may upload food photos. */
export const canUploadFoodPhotos = (sectorId, positionId) =>
  Boolean(getPosition(sectorId, positionId)?.photos);

function buildAllPositions() {
  return Object.entries(POSITIONS).flatMap(([sectorId, list]) =>
    list.map((p) => ({ ...p, sectorId }))
  );
}

function buildPositionsBySector() {
  return SECTORS.map((sector) => ({
    ...sector,
    options: POSITIONS[sector.id] || [],
  }));
}

function buildPositionById(all) {
  return all.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
}

export let ALL_POSITIONS = buildAllPositions();

/**
 * Every position, grouped by its sector — for the places that must offer the
 * whole taxonomy rather than one sector's slice, such as past roles in a work
 * history, which need not sit in the sector the candidate works in today.
 */
export let POSITIONS_BY_SECTOR = buildPositionsBySector();

/** Flat lookup, so a stored position id can be rendered in either language. */
export let POSITION_BY_ID = buildPositionById(ALL_POSITIONS);

export function recomputePositionExports() {
  ALL_POSITIONS = buildAllPositions();
  POSITIONS_BY_SECTOR = buildPositionsBySector();
  POSITION_BY_ID = buildPositionById(ALL_POSITIONS);
}

/** Replace sector/position fixture data from API taxonomy items (in place). */
export function hydrateSectorsFromApi(items) {
  const sectors = items
    .filter((item) => item.type === "sector")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const positions = items
    .filter((item) => item.type === "position")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (sectors.length) {
    SECTORS.splice(
      0,
      SECTORS.length,
      ...sectors.map((s) => ({
        id: s.key,
        fr: s.label?.fr || "",
        ar: s.label?.ar || "",
        en: s.label?.en || "",
      }))
    );
  }

  if (positions.length) {
    Object.keys(POSITIONS).forEach((key) => {
      delete POSITIONS[key];
    });

    positions.forEach((p) => {
      const parentKey = p.parentKey;
      if (!parentKey) return;
      if (!POSITIONS[parentKey]) POSITIONS[parentKey] = [];
      POSITIONS[parentKey].push({
        id: p.key,
        fr: p.label?.fr || "",
        ar: p.label?.ar || "",
        en: p.label?.en || "",
        photos: Boolean(p.meta?.allowsFoodPhotos),
      });
    });
  }

  if (sectors.length || positions.length) {
    recomputePositionExports();
  }
}
