"use client";

// The guest -> signup conversion gate. Change Requirements section 03:
//
//   "Visitors can browse offers and cook profiles without registering, but can
//    only see the first page of results. Clicking any offer or profile triggers
//    a sign-up/login prompt."
//
//   "When a guest clicks 'Apply Now': redirect to sign-up if not logged in. If
//    already logged in, proceed normally. Only one button needed — no duplicate
//    Apply + Sign Up buttons."
//
// `requireAuth(fn)` is the single entry point that encodes that rule: it runs
// `fn` for a signed-in user and opens this modal for everyone else. Wrapping a
// click in it is all a component has to do.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChefHat, X } from "lucide-react";
import { useSession } from "@/lib/session";
import { useT } from "@/i18n/LocaleProvider";

const GateContext = createContext(null);

export function SignupGateProvider({ children }) {
  const { isLoggedIn } = useSession();
  const [open, setOpen] = useState(false);

  const openGate = useCallback(() => setOpen(true), []);
  const closeGate = useCallback(() => setOpen(false), []);

  const requireAuth = useCallback(
    (action) => (event) => {
      if (isLoggedIn) return action?.(event);
      event?.preventDefault?.();
      event?.stopPropagation?.();
      setOpen(true);
      return undefined;
    },
    [isLoggedIn]
  );

  const value = useMemo(
    () => ({ requireAuth, openGate, closeGate, isLoggedIn }),
    [requireAuth, openGate, closeGate, isLoggedIn]
  );

  return (
    <GateContext.Provider value={value}>
      {children}
      {open && <GateModal onClose={closeGate} />}
    </GateContext.Provider>
  );
}

function GateModal({ onClose }) {
  const t = useT();

  // Portalled to <body> rather than rendered inline. Mounting an overlay in the
  // middle of the page tree means React inserts and removes a node among
  // siblings that browser extensions also touch, which is how you end up with
  // "NotFoundError: Failed to execute 'removeChild' on 'Node'". A portal keeps
  // the overlay in its own container that only React owns.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute end-4 top-4 text-gray-400 transition hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 rounded-xl bg-brand-soft p-3">
            <ChefHat className="text-brand" size={28} />
          </span>
          <h2 className="text-xl font-bold text-gray-900">{t("gate.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("gate.body")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/signUp"
            onClick={onClose}
            className="w-full rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("gate.signUp")}
          </Link>
          <Link
            href="/signIn"
            onClick={onClose}
            className="w-full rounded-lg border border-brand px-4 py-3 text-center text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            {t("gate.login")}
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useSignupGate() {
  const ctx = useContext(GateContext);
  if (!ctx) throw new Error("useSignupGate must be used inside <SignupGateProvider>");
  return ctx;
}
