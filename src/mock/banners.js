// Advertising slots — Change Requirements section 04.
//   - two sliding banners on the home page (middle + bottom), ~3s auto-rotate
//   - one sticky banner that follows the user across the whole session
//   - all of them admin-managed later; here they are static demo data
// Third-party ad sales are explicitly "not needed at launch".
//
// `image` is a photograph chosen to match the copy (see src/mock/photos.js) and
// `bg` is the tint laid over it: opaque on the side the text sits, fading to
// transparent so the right of the frame stays a legible photograph.
//
// Every string carries `Ar` and `En` variants, read through pick(). This copy
// used to be French-only, so the advertising strips stayed French whichever
// language the visitor chose.

import { PHOTOS } from "./photos";

export const AD_ROTATE_MS = 3000;

export const HOME_BANNERS_MIDDLE = [
  {
    id: "mid-1",
    title: "Équipez votre cuisine avec ProChef Maroc",
    titleAr: "جهّز الكوزينة ديالك مع ProChef Maroc",
    titleEn: "Equip your kitchen with ProChef Maroc",
    subtitle: "Matériel professionnel — livraison partout au Maroc",
    subtitleAr: "معدات مهنية — التوصيل لكامل المغرب",
    subtitleEn: "Professional equipment — delivered anywhere in Morocco",
    cta: "Découvrir",
    ctaAr: "اكتشف",
    ctaEn: "Discover",
    href: "#",
    image: PHOTOS.kitchenEquipment,
    bg: "from-[#3F5A2A] via-[#679046]/85 to-transparent",
  },
  {
    id: "mid-2",
    title: "Formation HACCP certifiante",
    titleAr: "تكوين HACCP بشهادة",
    titleEn: "Certified HACCP training",
    subtitle: "Sessions à Casablanca, Rabat et Marrakech",
    subtitleAr: "حصص فكازابلانكا، الرباط ومراكش",
    subtitleEn: "Sessions in Casablanca, Rabat and Marrakesh",
    cta: "S'inscrire",
    ctaAr: "سجّل",
    ctaEn: "Sign up",
    href: "#",
    image: PHOTOS.chefGloves,
    bg: "from-[#A8471A] via-[#E87B35]/80 to-transparent",
  },
  {
    id: "mid-3",
    title: "Assurance santé pour les professionnels",
    titleAr: "تأمين صحي للمهنيين",
    titleEn: "Health insurance for professionals",
    subtitle: "Couverture adaptée aux métiers de la restauration",
    subtitleAr: "تغطية مناسبة لمهن الإطعام",
    subtitleEn: "Cover designed for hospitality trades",
    cta: "En savoir plus",
    ctaAr: "زيد اعرف",
    ctaEn: "Learn more",
    href: "#",
    image: PHOTOS.handsOnThePass,
    bg: "from-slate-900 via-slate-800/85 to-transparent",
  },
];

export const HOME_BANNERS_BOTTOM = [
  {
    id: "bot-1",
    title: "Votre marque ici",
    titleAr: "العلامة ديالك هنا",
    titleEn: "Your brand here",
    subtitle: "Espace publicitaire disponible pour restaurants, hôtels et marques alimentaires",
    subtitleAr: "مساحة إشهارية متوفرة للريسطوات، الأوطيلات والعلامات الغذائية",
    subtitleEn: "Advertising space available for restaurants, hotels and food brands",
    cta: "Nous contacter",
    ctaAr: "تواصل معانا",
    ctaEn: "Contact us",
    href: "/contactUs",
    image: PHOTOS.terrace,
    bg: "from-[#33471F] via-[#4F6F35]/85 to-transparent",
  },
  {
    id: "bot-2",
    title: "Fournitures et consommables",
    titleAr: "لوازم ومواد الاستهلاك",
    titleEn: "Supplies and consumables",
    subtitle: "Tarifs professionnels pour les établissements inscrits",
    subtitleAr: "أثمنة مهنية للمؤسسات المسجلة",
    subtitleEn: "Trade prices for registered establishments",
    cta: "Voir l'offre",
    ctaAr: "شوف العرض",
    ctaEn: "View offer",
    href: "#",
    image: PHOTOS.produceShelves,
    bg: "from-amber-900 via-amber-700/85 to-transparent",
  },
];

/** Follows the user across pages — must never block content. */
export const STICKY_BANNER = {
  id: "sticky-1",
  title: "Nkhedmou.ma",
  titleAr: "Nkhedmou.ma",
  titleEn: "Nkhedmou.ma",
  subtitle: "Inscrivez-vous gratuitement et recevez les offres qui vous correspondent",
  subtitleAr: "تسجّل بالمجان وتوصل بالعروض اللي كتناسبك",
  subtitleEn: "Sign up free and receive the offers that match you",
  cta: "Créer un compte",
  ctaAr: "إنشاء حساب",
  ctaEn: "Create an account",
  href: "/signUp",
};
