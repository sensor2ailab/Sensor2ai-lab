import { Manrope, Great_Vibes } from "next/font/google";

// Single variable family (weights 200 to 800), self-hosted by next/font.
export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

// Signature/handwriting script, used only for the built-by credit. Self-hosted.
export const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-great-vibes",
});
