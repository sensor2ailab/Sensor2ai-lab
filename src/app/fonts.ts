import localFont from "next/font/local";

// Fonts are self-hosted (woff2 files in ./fonts) via next/font/local rather than
// next/font/google. This removes any build-time dependency on fonts.gstatic.com therefore, a
// network hiccup there would otherwise fail the whole production build. The Latin
// subset covers English plus standard accented characters.

// Manrope is a variable family (weights 200–800); one woff2 carries the whole axis.
export const manrope = localFont({
  src: "./fonts/Manrope-latin.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-manrope",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Signature/handwriting script, used only for the built-by credit. `optional` avoids
// a layout shift: this large decorative line would reflow badly when swapping from the
// cursive fallback, so the browser only uses it if it's ready instantly.
export const greatVibes = localFont({
  src: "./fonts/GreatVibes-latin.woff2",
  weight: "400",
  display: "optional",
  variable: "--font-great-vibes",
  fallback: ["cursive"],
});
