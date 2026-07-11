"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { heroFeatured, heroSlides } from "@/data/hero";
import { durBase, easeOut } from "@/lib/motion";

const AUTO_MS = 6000;

// Full-viewport hero: a full-bleed image carousel with a narrow white text card
// overlapping on the left (higher z-index) and the coral featured card bottom-right.
export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = heroSlides.length;

  const go = useCallback(
    (dir: number) => setIndex((prev) => (prev + dir + total) % total),
    [total],
  );

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, reduce, go]);

  const slide = heroSlides[index];
  if (!slide) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Lab highlights"
      className="hero-fill bg-accent relative min-h-[calc(100svh-2.75rem)] w-full overflow-hidden transition-[min-height] duration-(--dur-base) ease-out motion-reduce:transition-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Image inset from the left, bleeding to the top, right, and bottom. */}
      <AnimatePresence initial={false}>
        <m.div
          key={slide.id}
          className="absolute top-0 right-0 bottom-13 left-[10%]"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </m.div>
      </AnimatePresence>

      {/* Text card: a bottom strip on phones so the image stays visible above it,
          and the left overlapping card from sm up. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end p-4 sm:inset-x-auto sm:inset-y-0 sm:left-0 sm:items-center sm:p-8">
        <div className="bg-background flex w-full max-w-md flex-col gap-5 p-6 sm:p-8 lg:w-[30vw] lg:max-w-none">
          <div className="text-secondary flex items-center gap-4">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="rounded-pill border-border hover:border-accent hover:text-accent inline-flex size-8 items-center justify-center border transition-colors duration-(--dur-fast) ease-out"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="text-sm tabular-nums" aria-live="polite">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="rounded-pill border-border hover:border-accent hover:text-accent inline-flex size-8 items-center justify-center border transition-colors duration-(--dur-fast) ease-out"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <SlideText
            reduce={reduce}
            slideId={slide.id}
            lead={slide.lead}
            emphasis={slide.emphasis}
            note={slide.note}
          />
        </div>
      </div>

      {/* Featured card, bottom-right */}
      <Link
        href={heroFeatured.href}
        className="group bg-primary-soft text-foreground shadow-lift absolute right-0 bottom-0 z-10 hidden w-64 items-stretch overflow-hidden sm:flex sm:w-96"
      >
        <div className="flex flex-1 flex-col justify-center gap-1 p-5">
          <span className="text-xs font-bold tracking-wide uppercase">{heroFeatured.eyebrow}</span>
          <span className="text-lg font-extrabold">{heroFeatured.name}</span>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold tracking-wide uppercase underline underline-offset-4">
            View profile
            <ArrowRight
              className="size-3.5 transition-transform duration-(--dur-fast) ease-out group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
        <div className="relative w-24 shrink-0 sm:w-28">
          <Image
            src={heroFeatured.image}
            alt={heroFeatured.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
      </Link>
    </section>
  );
}

function SlideText({
  reduce,
  slideId,
  lead,
  emphasis,
  note,
}: {
  reduce: boolean | null;
  slideId: string;
  lead: string;
  emphasis: string;
  note: string;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  // Measure the new slide's height synchronously after it renders, then let the
  // wrapper ease to it. Animating a measured pixel height (not a transform-based
  // layout animation) keeps the text crisp instead of squishing during the change.
  useLayoutEffect(() => {
    if (measureRef.current) setHeight(measureRef.current.offsetHeight);
  }, [lead, emphasis, note]);

  const body = (
    <div ref={measureRef} className="flex flex-col gap-4">
      <h1 className="text-h1 font-extrabold text-balance">
        {lead} <span className="text-accent">{emphasis}</span>
      </h1>
      <p className="text-secondary">{note}</p>
    </div>
  );

  if (reduce) return body;

  return (
    <m.div
      className="overflow-hidden"
      animate={{ height }}
      transition={{ duration: 0.45, ease: easeOut }}
    >
      <m.div
        key={slideId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durBase, ease: easeOut, delay: 0.08 }}
      >
        {body}
      </m.div>
    </m.div>
  );
}
