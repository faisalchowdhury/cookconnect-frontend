"use client";

// Home page composition follows Change Requirements section 03 + 04 ordering:
//
//   1. main banner image (admin-replaceable background — ClientDoc 7)
//   2. split-screen hero, placed exactly where the stats row used to sit
//   3. advertising banner #1, middle of the page, auto-rotating
//   4. step-by-step "how it works", replacing "What Makes Us Different"
//   5. the three icons: chef, restaurant, document + green validation badge
//   6. the partner strip — "they trust us", scrolling establishment logos
//   7. stats, with "People who successfully found a job"
//   8. offer preview — guests see page one only, each card with its own Sign Up
//   9. advertising banner #2, bottom of the page

import { useEffect, useState } from "react";

import Banner from "@/app/component/home/Banner";
import SplitHero from "@/app/component/home/SplitHero";
import HowItWorks from "@/app/component/home/HowItWorks";
import Highlights from "@/app/component/home/Highlights";
import Partners from "@/app/component/home/Partners";
import Stats from "@/app/component/home/Stats";
import GuestOffers from "@/app/component/home/GuestOffers";
import FeedbackWidget from "@/app/component/home/FeedbackWidget";
import AdCarousel from "@/app/component/ui/AdCarousel";
import { HOME_BANNERS_MIDDLE, HOME_BANNERS_BOTTOM } from "@/mock/banners";
import { PARTNERS } from "@/mock/partners";
import { fetchBanners, fetchPartners, USE_API } from "@/mock/api";

export default function HomePage() {
  const [middleBanners, setMiddleBanners] = useState(HOME_BANNERS_MIDDLE);
  const [bottomBanners, setBottomBanners] = useState(HOME_BANNERS_BOTTOM);
  const [partners, setPartners] = useState(PARTNERS);

  useEffect(() => {
    if (!USE_API) return undefined;
    let alive = true;

    Promise.all([
      fetchBanners("home-middle"),
      fetchBanners("home-bottom"),
      fetchPartners(),
    ]).then(([middle, bottom, partnerItems]) => {
      if (!alive) return;
      if (middle?.length) setMiddleBanners(middle);
      if (bottom?.length) setBottomBanners(bottom);
      if (partnerItems?.length) setPartners(partnerItems);
    });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Banner />
      <SplitHero />
      <AdCarousel slides={middleBanners} className="py-10" />
      <HowItWorks />
      <Highlights />
      <Partners partners={partners} />
      <Stats />
      <GuestOffers />
      <AdCarousel slides={bottomBanners} className="py-10" />
      <FeedbackWidget />
    </>
  );
}
