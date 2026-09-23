// In-app notifications. Change Requirements 12: approvals, reminders and
// feedback replies all produce an in-app notification alongside an email.
//
// Every string carries all three languages. `body` previously had no Arabic
// variant at all, so an Arabic reader got a translated headline above a French
// paragraph; and nothing here had English, which is why switching to English
// left the notification list in French.

export const NOTIFICATIONS = [
  {
    id: "ntf-1",
    type: "approval",
    title: "Votre profil a été validé",
    titleAr: "البروفيل ديالك تصادق عليه",
    titleEn: "Your profile has been approved",
    body: "Félicitations, votre profil est maintenant visible par les employeurs et vous pouvez postuler aux offres.",
    bodyAr: "مبروك، البروفيل ديالك دابا كيبان للمشغّلين وتقدر ترشّح للعروض.",
    bodyEn: "Congratulations — your profile is now visible to employers and you can apply to offers.",
    date: "2026-08-16",
    read: false,
  },
  {
    id: "ntf-2",
    type: "job",
    title: "3 nouvelles offres correspondent à votre profil",
    titleAr: "3 عروض جداد كيتناسبو مع البروفيل ديالك",
    titleEn: "3 new offers match your profile",
    body: "Chef de cuisine à Casablanca, Sous-chef à Casablanca et Chef de partie à Meknès.",
    bodyAr: "شيف دكوزينة فكازابلانكا، سو شيف فكازابلانكا وشيف دي بارتي فمكناس.",
    bodyEn: "Head Chef in Casablanca, Sous Chef in Casablanca and Chef de Partie in Meknes.",
    date: "2026-08-15",
    read: false,
  },
  {
    id: "ntf-3",
    type: "application",
    title: "Votre candidature a été présélectionnée",
    titleAr: "الترشيح ديالك تختار",
    titleEn: "Your application has been shortlisted",
    body: "La Table Casablancaise a présélectionné votre candidature pour le poste de Chef de cuisine.",
    bodyAr: "La Table Casablancaise ختارات الترشيح ديالك لمنصب شيف دكوزينة.",
    bodyEn: "La Table Casablancaise has shortlisted your application for the Head Chef position.",
    date: "2026-08-13",
    read: true,
  },
  {
    id: "ntf-4",
    type: "offer",
    title: "Votre offre est en cours de validation",
    titleAr: "العرض ديالك فطريق المصادقة",
    titleEn: "Your offer is awaiting approval",
    body: "L'offre « Serveur — CDD » sera publiée dès validation par l'administration.",
    bodyAr: "العرض « سيرفور — CDD » غادي يتنشر منين تصادق عليه الإدارة.",
    bodyEn: "The offer “Waiter — fixed-term contract (CDD)” will go live once approved by the administration.",
    date: "2026-08-12",
    read: true,
  },
  {
    id: "ntf-5",
    type: "reminder",
    title: "Complétez votre profil pour postuler",
    titleAr: "كمّل البروفيل ديالك باش تقدر تسّجل",
    titleEn: "Complete your profile to apply",
    body: "Il vous manque encore quelques champs obligatoires avant de pouvoir postuler aux offres.",
    bodyAr: "باقي ناقصينك شي معلومات ضرورية قبل ما تقدر ترشّح للعروض.",
    bodyEn: "A few required fields are still missing before you can apply to offers.",
    date: "2026-08-10",
    read: true,
  },
  {
    id: "ntf-6",
    type: "feedback",
    title: "L'administration a répondu à votre message",
    titleAr: "الإدارة جاوبات على الرسالة ديالك",
    titleEn: "The administration replied to your message",
    body: "Merci pour votre retour, nous avons pris en compte votre remarque sur les filtres de recherche.",
    bodyAr: "شكرا على الملاحظة ديالك، خدينا بعين الاعتبار الرأي ديالك على فلاتر البحث.",
    bodyEn: "Thank you for your feedback — we have taken your remark about the search filters on board.",
    date: "2026-08-06",
    read: true,
  },
];

/** Badge count on the navbar bell. */
export const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;
