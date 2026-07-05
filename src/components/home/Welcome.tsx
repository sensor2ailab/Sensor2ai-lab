"use client";

import Image from "next/image";
import { m, useReducedMotion } from "motion/react";
import { site } from "@/data/site";
import { durBase, easeOut, fadeUp, staggerContainer } from "@/lib/motion";
import { Container } from "@/components/ui/Container";

const viewport = { once: true, margin: "0px 0px -12% 0px" };
const titleWords = `Welcome to the ${site.name}`.split(" ");

// Shared edge fade: both the grid and the trace lines dissolve toward the corners
// instead of hard-cutting at the section edges, so line starts fade in cleanly.
const EDGE_MASK = "radial-gradient(ellipse 82% 76% at 50% 50%, black 45%, transparent 94%)";

// Faint token-coloured grid that fills the section without competing with the
// centred content.
const gridStyle = {
  backgroundImage:
    "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
  backgroundSize: "3.5rem 3.5rem",
  maskImage: EDGE_MASK,
  WebkitMaskImage: EDGE_MASK,
} as const;

const lineMask = { maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK } as const;

// Centered welcome: lab logo over a subtle grid, a title that reveals word by
// word, and the full institute name below in uppercase.
export function Welcome() {
  const reduce = useReducedMotion();

  return (
    <section
      id="welcome"
      className="bg-background relative isolate scroll-mt-28 overflow-hidden py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={gridStyle}
      />

      {/* Circuit-trace lines in the grid colour: they enter from the edges, bend
          once, and end in a small node, filling the space without noise. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 620"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        style={lineMask}
        className="text-border pointer-events-none absolute inset-0 -z-10 h-full w-full"
      >
        <path d="M0 160 H190 Q240 160 240 210 V340" />
        <circle cx="240" cy="340" r="5" fill="currentColor" stroke="none" />
        <path d="M1150 0 V120 Q1150 170 1100 170 H960" />
        <circle cx="960" cy="170" r="5" fill="currentColor" stroke="none" />
        <path d="M170 620 V480 Q170 430 220 430 H380" />
        <circle cx="380" cy="430" r="5" fill="currentColor" stroke="none" />
        <path d="M1440 280 H1300 Q1250 280 1250 330 V450" />
        <circle cx="1250" cy="450" r="5" fill="currentColor" stroke="none" />
        <path d="M1290 620 V500 Q1290 450 1340 450 H1440" />
      </svg>

      <Container>
        <div className="flex flex-col items-center gap-8 text-center">
          <m.div
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewport}
            transition={{ duration: durBase, ease: easeOut }}
          >
            <Image
              src="/assets/img/Logo.png"
              alt={`${site.name} logo`}
              width={1536}
              height={1024}
              priority={false}
              loading="eager"
              className="h-auto w-40 sm:w-52"
            />
          </m.div>

          {reduce ? (
            <h2 className="text-display max-w-4xl font-extrabold text-balance">
              Welcome to the {site.name}
            </h2>
          ) : (
            <m.h2
              className="text-display max-w-4xl font-extrabold text-balance"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
            >
              {titleWords.map((word, i) => (
                <m.span key={`${word}-${i}`} variants={fadeUp} className="mr-[0.25em] inline-block">
                  {word}
                </m.span>
              ))}
            </m.h2>
          )}

          <m.span
            aria-hidden="true"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: durBase, ease: easeOut, delay: reduce ? 0 : 0.2 }}
            className="rounded-pill bg-accent h-1 w-16 origin-center"
          />

          <m.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: durBase, ease: easeOut, delay: reduce ? 0 : 0.3 }}
            className="text-muted text-sm font-semibold tracking-[0.25em] uppercase sm:text-base"
          >
            {site.institute}
          </m.p>
        </div>
      </Container>
    </section>
  );
}
