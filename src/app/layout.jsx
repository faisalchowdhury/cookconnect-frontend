import { DM_Sans, Urbanist, Inter, Poppins } from "next/font/google";
import "../app/globals.css";

import Providers from "../Provider/Providers";

// Import fonts
const dmSans = DM_Sans({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-dm-sans" });
const urbanist = Urbanist({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-urbanist" });
const inter = Inter({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Nkhedmou.ma — Emploi restauration & hôtellerie au Maroc",
  description:
    "Nkhedmou.ma met en relation cuisiniers, boulangers et personnel d'hôtel avec les restaurants, hôtels et boulangeries qui recrutent au Maroc.",
};

export default function RootLayout({ children }) {
  // `lang` / `dir` start on the French default and are updated on the client by
  // LocaleProvider when the visitor switches to Darija — hence
  // suppressHydrationWarning on <html>: the attributes legitimately differ from
  // the server HTML once a stored locale is applied. On <body> it absorbs the
  // attributes browser extensions inject before React hydrates.
  //
  // `translate="no"` is deliberate. The site ships its own FR/Darija switcher,
  // and Chrome's auto-translate rewrites text nodes underneath React; when React
  // later removes one of those nodes it throws
  // "NotFoundError: Failed to execute 'removeChild' on 'Node'", which takes the
  // whole page down. Opting out of machine translation removes that class of
  // crash without costing the user anything the app doesn't already provide.
  return (
    <html lang="fr" dir="ltr" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        suppressHydrationWarning
        className={`notranslate ${dmSans.variable} ${urbanist.variable} ${poppins.variable} ${inter.variable} antialiased bg-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
