"use client";

import { Fragment } from "react";
import { m, useReducedMotion, type Variants } from "motion/react";
import { easeOut } from "@/lib/motion";

// Each letter lifts and fades in, staggered by its position, when the heading
// scrolls into view. One IntersectionObserver on the wrapper drives the whole
// thing; letters animate transform/opacity only, so it stays cheap.
const letter: Variants = {
  hidden: { opacity: 0, y: "0.5em" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut, delay: i * 0.03 },
  }),
};

export function LetterReveal({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  const words = text.split(" ");
  let index = 0;

  return (
    <m.span
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {words.map((word, wi) => (
        <Fragment key={wi}>
          {/* Keep each word unbreakable so letters never wrap mid-word. */}
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {Array.from(word).map((char) => {
              const i = index++;
              return (
                <m.span key={i} className="inline-block" variants={letter} custom={i}>
                  {char}
                </m.span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </m.span>
  );
}
