"use client";

import StoreProvider from "./StoreProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { SessionProvider } from "@/lib/session";
import { SignupGateProvider } from "@/app/component/ui/SignupGate";
import TaxonomyHydrator from "@/components/TaxonomyHydrator";

// Order matters: the signup gate reads the session, and its modal reads the
// dictionary, so both providers must sit above it.
const Providers = ({ children }) => {
  return (
    <StoreProvider>
      <LocaleProvider>
        <SessionProvider>
          <TaxonomyHydrator>
            <SignupGateProvider>{children}</SignupGateProvider>
          </TaxonomyHydrator>
        </SessionProvider>
      </LocaleProvider>
    </StoreProvider>
  );
};

export default Providers;
