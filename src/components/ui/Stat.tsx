"use client";

import Link from "next/link";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { easeOut } from "@/lib/motion";

interface StatProps {
  value: number;
  label: string;
  href: string;
  icon: ReactNode;
  note: string;
  suffix?: string;
}

// Count-up number that runs once when scrolled into view. Static when reduced.
// The icon is passed pre-rendered so this client component stays serializable.
export function Stat({ value, label, href, icon, note, suffix }: StatProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: easeOut,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  // Reduced motion shows the final value straight away.
  const shown = reduce ? value : display;

  return (
    <Link
      ref={ref}
      href={href}
      className="group border-border bg-background shadow-card hover:border-primary hover:shadow-lift relative flex h-full flex-col items-center gap-3 overflow-hidden rounded-lg border p-8 text-center transition-[transform,border-color,box-shadow] duration-(--dur-base) ease-out hover:-translate-y-1"
    >
      {/* Soft accent wash behind the icon so the card never reads empty. */}
      <span
        aria-hidden="true"
        className="from-primary-soft pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b to-transparent opacity-70"
      />
      <span className="bg-primary-soft text-primary-hover relative inline-flex size-14 items-center justify-center rounded-xl">
        {icon}
      </span>
      <span className="text-foreground relative text-5xl font-extrabold tracking-tight tabular-nums">
        {shown}
        {suffix}
      </span>
      <span className="text-foreground group-hover:text-primary relative text-lg font-semibold transition-colors duration-(--dur-fast)">
        {label}
      </span>
      <span className="text-muted relative max-w-[26ch] text-sm text-balance">{note}</span>
    </Link>
  );
}
