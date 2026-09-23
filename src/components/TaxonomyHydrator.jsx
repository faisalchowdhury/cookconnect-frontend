"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { hydrateTaxonomiesFromApi, USE_API } from "@/lib/taxonomyHydrate";

const TaxonomyContext = createContext(0);

export const useTaxonomyVersion = () => useContext(TaxonomyContext);

export default function TaxonomyHydrator({ children }) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!USE_API) return undefined;
    let alive = true;
    hydrateTaxonomiesFromApi().then((ok) => {
      if (alive && ok) setVersion((v) => v + 1);
    });
    return () => {
      alive = false;
    };
  }, []);

  return <TaxonomyContext.Provider value={version}>{children}</TaxonomyContext.Provider>;
}
