/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Nkhedmou.ma brand palette
        brand: {
          DEFAULT: "#679046", // primary green
          dark: "#4F6F35",
          light: "#8FAF74",
          tint: "#E8EFE3", // hero / section wash
          soft: "#F0F4EC", // icon chip background
          mint: "#D9F9E6", // employer icon chip
        },
        accent: {
          DEFAULT: "#E87B35", // primary orange (CTA)
          dark: "#D2691E",
          light: "#F5A66E",
          tint: "#FDF1E7",
        },
      },
      // Partner strip (home page). The track holds the partner list twice, so
      // half its width is exactly one copy and the loop is seamless. Duration
      // is set per-instance, from the list length.
      //
      // RTL needs its own keyframe rather than `animation-direction: reverse`.
      // Under `dir="rtl"` a `w-max` flex row is anchored to its right edge and
      // overflows leftwards, so the visible window sits at the END of the
      // track: it has to travel right (+50%) to pull the next card into view.
      // Reversing the LTR keyframe instead starts the track at -50%, which in
      // RTL is already past the window — the strip renders empty.
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-rtl": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(50%)" },
        },
      },
      animation: {
        marquee: "marquee linear infinite",
        "marquee-rtl": "marquee-rtl linear infinite",
      },

      fontFamily: {
        dm: ["var(--font-dm-sans)", "sans-serif"],
        urban: ["var(--font-urbanist)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
