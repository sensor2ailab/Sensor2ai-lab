"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

// Container that reveals its <StaggerItem> children in sequence when scrolled into view.
export function Stagger({ children, className }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div className={className} variants={fadeUp}>
      {children}
    </m.div>
  );
}

// Mount-based variants (animate immediately, not on scroll). Use these for content
// that is fetched client-side and rendered after a loading state, where a scroll
// trigger can miss and leave items stuck invisible.
export function MountStagger({ children, className }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div className={className} variants={staggerContainer} initial="hidden" animate="show">
      {children}
    </m.div>
  );
}

export function MountStaggerItem({ children, className }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div className={className} variants={fadeUp}>
      {children}
    </m.div>
  );
}
