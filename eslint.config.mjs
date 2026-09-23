// ESLint 9 flat config. eslint-config-next 16 ships flat configs natively, so
// it is imported directly — the FlatCompat bridge is only needed for the older
// eslintrc-style releases and actually breaks against this version.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
];

export default config;
