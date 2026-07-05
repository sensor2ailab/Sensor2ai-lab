import type { Transition, Variants } from "motion/react";

// Shared motion constants so entrances feel consistent across the site.
// Mirrors --ease-out and --dur-base from globals.css.
export const easeOut: Transition["ease"] = [0.22, 0.61, 0.36, 1];
export const durBase = 0.32;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: durBase, ease: easeOut } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
