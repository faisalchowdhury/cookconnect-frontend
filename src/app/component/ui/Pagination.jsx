"use client";

// Pagination with the guest cap built in. Change Requirements 03 + 07:
// 12 results per page, and a signed-out visitor can only reach page 1 — the
// remaining pages are shown but locked behind the signup gate.

import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { useSignupGate } from "./SignupGate";

export default function Pagination({ page, totalPages, visiblePages, onChange }) {
  const t = useT();
  const { openGate, isLoggedIn } = useSignupGate();

  if (totalPages <= 1) return null;

  const reachable = visiblePages ?? totalPages;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const go = (target) => {
    if (target < 1 || target > totalPages) return;
    // Anything past the guest allowance converts into a signup prompt.
    if (target > reachable) return openGate();
    onChange(target);
  };

  return (
    <nav className="mt-8 flex flex-col items-center gap-3" aria-label={t("common.page")}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label={t("common.previous")}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 rtl:rotate-180"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => {
          const locked = p > reachable;
          return (
            <button
              key={p}
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center gap-1 rounded-md px-2 text-sm font-medium transition ${
                p === page
                  ? "bg-accent text-white"
                  : locked
                  ? "border border-dashed border-gray-300 text-gray-400 hover:border-accent hover:text-accent"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
              {locked && <Lock size={11} />}
            </button>
          );
        })}

        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label={t("common.next")}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 rtl:rotate-180"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {!isLoggedIn && totalPages > reachable && (
        <button
          onClick={openGate}
          className="text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          {t("gate.morePages", { n: totalPages })}
        </button>
      )}
    </nav>
  );
}
