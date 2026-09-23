"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoNotificationsOutline } from "react-icons/io5";
import { ChevronDown, Menu, X } from "lucide-react";

import logo from "../../../assets/CookconneKt 1.png";
import { useT } from "@/i18n/LocaleProvider";
import LanguageSwitch from "@/app/component/ui/LanguageSwitch";
import { useSession } from "@/lib/session";
import { fetchUnreadNotificationCount } from "@/mock/api";
import { NOTIFICATIONS_CHANGED_EVENT } from "@/lib/notificationsSignal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const { user, isLoggedIn, isEmployer, logout } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  // The count is tagged with the account it was fetched for, so signing out (or
  // switching accounts) shows 0 immediately without resetting state in an effect.
  const unreadKey = isLoggedIn ? user?.id || "signed-in" : null;
  const [unread, setUnread] = useState({ key: null, count: 0 });
  const unreadCount = unread.key === unreadKey ? unread.count : 0;

  useEffect(() => {
    if (!unreadKey) return undefined;
    let alive = true;
    const refresh = () => {
      fetchUnreadNotificationCount()
        .then((count) => {
          if (alive) setUnread({ key: unreadKey, count });
        })
        .catch(() => {});
    };
    refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    return () => {
      alive = false;
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    };
  }, [unreadKey, pathname]);

  const dashboardLink = isEmployer ? "/resturentDashboard" : "/dashboard";

  const navItems = [
    { label: t("nav.findProfiles"), href: "/jobProfile" },
    { label: t("nav.jobOffers"), href: "/allJobs" },
    ...(isEmployer ? [{ label: t("nav.postOffer"), href: "/jobPost" }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src={logo} alt="" width={38} height={38} />
          <span className="text-lg font-bold text-gray-900">{t("brand.name")}</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`font-poppins text-[15px] transition hover:text-accent ${
                  pathname === item.href ? "font-semibold text-accent" : "text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitch />

          {isLoggedIn ? (
            <>
              <Link href="/notification" aria-label={t("nav.notifications")}>
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition hover:bg-gray-50 ${
                    pathname === "/notification" ? "border-accent bg-accent text-white" : "text-gray-700"
                  }`}
                >
                  <IoNotificationsOutline size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user?.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <span className="max-w-[130px] truncate text-start text-sm">
                    <span className="block text-xs text-gray-500">{t("nav.greeting")}</span>
                    <span className="block truncate font-medium text-gray-800">{user?.name}</span>
                  </span>
                  <ChevronDown size={15} className="text-gray-400" />
                </button>

                {userOpen && (
                  <div className="absolute end-0 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <Link
                      href={dashboardLink}
                      onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t("nav.dashboard")}
                    </Link>
                    <Link
                      href={isEmployer ? "/resturentProfile" : "/editProfile"}
                      onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {isEmployer ? t("employer.profileTitle") : t("profile.editTitle")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full border-t border-gray-100 px-4 py-2.5 text-start text-sm text-red-600 hover:bg-red-50"
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/signIn"
                className="rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-tint"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signUp"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                {t("nav.signUp")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitch compact />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t("nav.menu")}
            className="rounded-md p-2 text-gray-800 hover:bg-gray-100"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2.5 ${
                    pathname === item.href ? "font-semibold text-accent" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="mt-2 border-t border-gray-100 pt-3">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user?.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <span className="text-sm font-medium text-gray-800">{user?.name}</span>
                  </div>
                  <Link href={dashboardLink} onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">
                    {t("nav.dashboard")}
                  </Link>
                  <Link href="/notification" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">
                    {t("nav.notifications")}
                  </Link>
                  <button onClick={handleLogout} className="text-start text-sm text-red-600">
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/signUp"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    {t("nav.signUp")}
                  </Link>
                  <Link
                    href="/signIn"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md border border-accent px-4 py-2.5 text-center text-sm font-medium text-accent"
                  >
                    {t("nav.login")}
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
