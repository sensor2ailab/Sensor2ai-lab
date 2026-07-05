"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { durBase, easeOut } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

// Fade-and-rise a single block into view, once. No motion when the user opts out.
export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: durBase, ease: easeOut, delay }}
    >
      {children}
    </m.div>
  );
}
