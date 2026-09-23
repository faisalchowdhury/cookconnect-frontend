"use client";

// Session state backed by localStorage. In demo mode, login(role) picks a fixture
// account. When NEXT_PUBLIC_API_URL is set, credentials flow through the backend.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { subscribe, getJSON, setValue, removeValue, SESSION_KEY as STORAGE_KEY } from "@/lib/browserStore";
import {
  USE_API,
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  forgotPassword,
  fetchMe,
  saveCurrentCandidate,
} from "@/mock/api";

const SessionContext = createContext(null);

export const ROLES = { GUEST: "guest", CANDIDATE: "candidate", EMPLOYER: "employer" };

export const PENDING_AUTH_KEY = "nkhedmou.pendingAuth";

const DEMO_USERS = {
  [ROLES.CANDIDATE]: {
    id: "cand-1",
    name: "Youssef El Amrani",
    email: "youssef.elamrani@example.ma",
    avatar: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
  },
  [ROLES.EMPLOYER]: {
    id: "emp-2",
    name: "La Table Casablancaise",
    email: "rh@tablecasa.ma",
    avatar: "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png",
  },
};

export const DEMO_INCOMPLETE_CANDIDATE = {
  id: "cand-4",
  name: "Salma Idrissi",
  email: "salma.idrissi@example.ma",
  avatar: "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
};

const GUEST = { role: ROLES.GUEST, user: null };

function backendRoleToSession(role) {
  if (role === "employer") return ROLES.EMPLOYER;
  if (role === "candidate") return ROLES.CANDIDATE;
  return ROLES.GUEST;
}

export function mapAuthUser(rawUser, profile = null) {
  if (!rawUser) return null;
  const role = backendRoleToSession(rawUser.role);
  let name = rawUser.email?.split("@")[0] || "";
  let avatar;

  if (profile) {
    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    if (fullName) name = fullName;
    else if (profile.businessName) name = profile.businessName;
    avatar = profile.photoUrl || profile.logoUrl || profile.photo || profile.logo;
  }

  return {
    id: String(rawUser.id),
    name,
    email: rawUser.email,
    avatar,
    role,
  };
}

function persistSession({ role, user, accessToken }) {
  setValue(STORAGE_KEY, { role, user, accessToken });
  return { role, user, accessToken };
}

function persistFromMe(me, accessToken) {
  const user = mapAuthUser(me.user, me.profile);
  const role = user?.role || ROLES.GUEST;
  return persistSession({
    role,
    user,
    accessToken: accessToken ?? getJSON(STORAGE_KEY, null)?.accessToken,
  });
}

export function SessionProvider({ children }) {
  const session = useSyncExternalStore(
    subscribe,
    () => {
      const stored = getJSON(STORAGE_KEY, GUEST);
      return stored?.role && stored.role !== ROLES.GUEST ? stored : GUEST;
    },
    () => GUEST
  );

  const login = useCallback((role, user) => {
    const next = { role, user: user || DEMO_USERS[role] || null };
    setValue(STORAGE_KEY, next);
    return next;
  }, []);

  const loginWithCredentials = useCallback(async (email, password) => {
    const { accessToken, user: rawUser } = await loginUser({ email, password });
    const user = mapAuthUser(rawUser);
    if (user.role === ROLES.GUEST) {
      // Admin accounts belong to the dashboard; end the session the API just opened.
      await logoutUser().catch(() => {});
      const err = new Error("This account cannot sign in on the public site.");
      err.statusCode = 403;
      err.code = "admin-account";
      throw err;
    }
    return persistSession({ role: user.role, user, accessToken });
  }, []);

  const registerAndStart = useCallback(async ({ email, password, role, firstName, lastName, locale }) => {
    const apiRole = role === ROLES.EMPLOYER ? "employer" : "candidate";
    setValue(PENDING_AUTH_KEY, { email, password, role, firstName, lastName });
    await registerUser({ email, password, role: apiRole, locale });
    return { email, role: apiRole };
  }, []);

  const completeOtp = useCallback(async (email, code) => {
    await verifyOtp({ email, code });

    const pending = getJSON(PENDING_AUTH_KEY, null);
    if (pending?.email?.toLowerCase() === email.toLowerCase()) {
      const sessionData = await loginWithCredentials(pending.email, pending.password);
      removeValue(PENDING_AUTH_KEY);

      if (pending.role === ROLES.CANDIDATE && (pending.firstName || pending.lastName)) {
        try {
          await saveCurrentCandidate({
            firstName: pending.firstName || "",
            lastName: pending.lastName || "",
          });
        } catch {
          // Profile patch can wait until the edit screen.
        }
      }

      return sessionData;
    }

    return { verified: true };
  }, [loginWithCredentials]);

  const resendVerification = useCallback(async (email) => {
    await resendOtp({ email });
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    await forgotPassword({ email });
  }, []);

  const logout = useCallback(async () => {
    if (USE_API) {
      try {
        await logoutUser();
      } catch {
        // Clear local session even when the API call fails.
      }
    }
    removeValue(STORAGE_KEY);
    removeValue(PENDING_AUTH_KEY);
  }, []);

  useEffect(() => {
    if (!USE_API) return undefined;

    let cancelled = false;

    (async () => {
      const stored = getJSON(STORAGE_KEY, null);
      if (!stored?.accessToken) return;

      try {
        // fetchMe refreshes an expired token itself and clears the session if that fails.
        const me = await fetchMe();
        if (!cancelled && me?.user) persistFromMe(me);
      } catch (err) {
        // 404 means the account behind the token no longer exists, e.g. after a reseed.
        if (!cancelled && [401, 403, 404].includes(err.statusCode)) removeValue(STORAGE_KEY);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      isLoggedIn: session.role !== ROLES.GUEST,
      isCandidate: session.role === ROLES.CANDIDATE,
      isEmployer: session.role === ROLES.EMPLOYER,
      login,
      loginWithCredentials,
      registerAndStart,
      completeOtp,
      resendVerification,
      requestPasswordReset,
      logout,
    }),
    [
      session,
      login,
      loginWithCredentials,
      registerAndStart,
      completeOtp,
      resendVerification,
      requestPasswordReset,
      logout,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
