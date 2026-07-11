"use client";

import { Fragment } from "react";
import { m, useReducedMotion, type Variants } from "motion/react";
import { easeOut } from "@/lib/motion";

// Each letter slides up into place from behind a clip
const letter: Variants = {
  hidden: { y: "115%" },
  show: (i: number) => ({
    y: 0,
    transition: { duration: 0.5, ease: easeOut, delay: i * 0.03 },
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
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {/* Real text for assistive tech; the animated glyphs below are decorative. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <Fragment key={wi}>
            {/* Per-word clip so letters reveal from below; padding keeps descenders
                from being shaved at rest. Negative margin cancels that padding in flow. */}
            <span className="mb-[-0.14em] inline-flex overflow-hidden pb-[0.14em] align-bottom">
              {Array.from(word).map((char) => {
                const i = index++;
                return (
                  <m.span
                    key={i}
                    className="inline-block will-change-transform"
                    variants={letter}
                    custom={i}
                  >
                    {char}
                  </m.span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </m.span>
  );
}
