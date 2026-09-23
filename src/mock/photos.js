// Real photography for the banners.
//
// The four `i.ibb.co/Rectangle-***.png` files these replace were grey mockup
// rectangles left over from the design hand-off, which is why the banners read
// as washed-out empty blocks. These are actual restaurant / kitchen photographs
// from Unsplash, served through Unsplash's own CDN, which handles resizing and
// format negotiation via the query string (`auto=format` gives WebP/AVIF where
// the browser supports it).
//
// Every photo here was chosen against the copy that sits on top of it — a
// commercial kitchen behind the hero, gloved hands behind the HACCP hygiene ad,
// produce shelves behind the supplies ad — rather than being decorative filler.
// The `focus` values name the part of the frame that must survive the crop:
// banners are wide and short, so `object-cover` throws away a lot of height and
// the subject drifts out of shot without them.
//
// Unsplash images are free to use commercially with no attribution required.
// When the client supplies their own photography, swap the URLs here — every
// banner in the app reads from this one file.

/**
 * @param id  Unsplash photo id, e.g. "photo-1600565193348-f74bd3c7ccdf"
 * @param w   Source width in px. Full-bleed banners need a wide, high-quality
 *            source (retina phones render them at ~2x); the short ad strips do
 *            not, so they ask for less and stay light on mobile data.
 * @param q   JPEG/WebP quality.
 */
const unsplash = (id, w = 2000, q = 85) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const PHOTOS = {
  /** Chef flambéing on the line in a working commercial kitchen. */
  kitchenService: {
    src: unsplash("photo-1600565193348-f74bd3c7ccdf"),
    focus: "center",
  },
  /** Chef plating under the pass heat lamps. */
  chefPlating: {
    src: unsplash("photo-1577219491135-ce391730fb2c"),
    // The chef sits in the upper half of the frame; a centre crop cuts his head.
    focus: "50% 35%",
  },
  /** Restaurant dining room, set and empty before service. */
  diningRoom: {
    src: unsplash("photo-1517248135467-4c7edcad34c4"),
    focus: "center",
  },
  /** Knife, board, pan and prepped ingredients — kitchen equipment. */
  kitchenEquipment: {
    src: unsplash("photo-1466637574441-749b8f19452f", 1400, 80),
    focus: "center",
  },
  /** Chef in whites plating in gloves — food-hygiene / HACCP. */
  chefGloves: {
    src: unsplash("photo-1541614101331-1a5a3a194e92", 1400, 80),
    focus: "50% 40%",
  },
  /** Close-up of a cook's hands finishing plates on the pass. */
  handsOnThePass: {
    src: unsplash("photo-1577106263724-2c8e03bfe9cf", 1400, 80),
    focus: "center",
  },
  /** Restaurant terrace over the water at golden hour. */
  terrace: {
    src: unsplash("photo-1559339352-11d035aa65de", 1400, 80),
    focus: "center",
  },
  /** Stocked fruit-and-vegetable shelves — supplies and consumables. */
  produceShelves: {
    src: unsplash("photo-1542838132-92c53300491e", 1400, 80),
    focus: "center",
  },
};
