"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../../../assets/CookconneKt 1.png";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaSquareInstagram, FaXTwitter } from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io";
import { MdEmail, MdPhone } from "react-icons/md";
import { useT } from "@/i18n/LocaleProvider";

const Footer = () => {
  const t = useT();

  const candidateLinks = [
    { href: "/allJobs", label: t("nav.jobOffers") },
    { href: "/signUp", label: t("auth.createAccount") },
    { href: "/editProfile", label: t("profile.editTitle") },
  ];

  const employerLinks = [
    { href: "/jobProfile", label: t("nav.findProfiles") },
    { href: "/jobPost", label: t("employer.postJob") },
    { href: "/resturentDashboard", label: t("employer.dashboard") },
  ];

  const legalLinks = [
    { href: "/aboutUs", label: t("footer.aboutUs") },
    { href: "/contactUs", label: t("footer.contact") },
    { href: "/privacyPolicy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
  ];

  return (
    <footer className="bg-[#2D2D2D] px-5 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Image src={logo} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
              <span className="text-lg font-bold">{t("brand.name")}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-300">
              {t("footer.aboutText")}
            </p>
            <div className="mt-6 flex gap-4">
              {[FaFacebookF, FaSquareInstagram, FaXTwitter, FaLinkedinIn, IoLogoYoutube].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="text-gray-400 transition hover:text-white">
                  <Icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title={t("footer.forCandidates")} links={candidateLinks} />
          <FooterColumn title={t("footer.forEmployers")} links={employerLinks} />

          <div>
            <h3 className="mb-5 text-base font-semibold">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-300 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3">
              <a
                href="mailto:contact@nkhedmou.ma"
                className="flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
              >
                <MdEmail className="text-lg text-gray-400" />
                contact@nkhedmou.ma
              </a>
              <p className="flex items-center gap-2 text-sm text-gray-300">
                <MdPhone className="text-lg text-gray-400" />
                +212 5 22 XX XX XX
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {t("brand.name")} — {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-5 text-base font-semibold">{title}</h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-gray-300 transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
