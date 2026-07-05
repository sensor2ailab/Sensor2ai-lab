"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Loads only the DOM animation features so the motion bundle stays small.
// strict mode enforces using the lightweight `m` components everywhere.
// reducedMotion="user" makes motion honor the OS setting as a global fallback.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
