"use client";

import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import {
  Bot,
  CircuitBoard,
  HeartPulse,
  Navigation,
  Server,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { about } from "@/data/about";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Reveal } from "@/components/motion/Reveal";

function facilityIcon(facility: string): LucideIcon {
  const f = facility.toLowerCase();
  if (f.includes("wearable") || f.includes("health")) return HeartPulse;
  if (f.includes("gpu") || f.includes("workstation") || f.includes("edge")) return Server;
  if (f.includes("localization") || f.includes("indoor")) return Navigation;
  if (f.includes("robot") || f.includes("mobility")) return Bot;
  if (f.includes("wireless") || f.includes("network")) return Wifi;
  return CircuitBoard;
}

// One word of the scroll-revealed statement: it lifts from faint to solid as the
// paragraph passes through its slice of the scroll range. The faint floor is 0.65
// (not 0.5) so even un-revealed words keep a 4.5:1 contrast ratio therefore, the effect still
// reads clearly, but the text is never inaccessible.
function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.65, 1]);
  return <m.span style={{ opacity }}>{children} </m.span>;
}

function RevealStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.35"] });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className="text-foreground mx-auto max-w-4xl text-lg leading-snug font-medium text-balance sm:text-xl"
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = Math.min(start + 1.5 / words.length, 1);
        return (
          <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

export function AboutSection() {
  const reduce = useReducedMotion();

  return (
    <Section id="about" tone="surface">
      <Container className="flex flex-col items-center justify-center gap-14 text-center">
        <SectionHeading eyebrow="About us" title="Building intelligence into the physical world" />

        {reduce ? (
          <p className="text-foreground mx-auto max-w-4xl text-xl leading-snug font-medium text-balance sm:text-lg">
            {about.paragraphs[0]}
          </p>
        ) : (
          <RevealStatement text={about.paragraphs[0] ?? ""} />
        )}

        <div className="flex flex-col gap-5">
          <h3 className="text-muted text-center text-sm font-semibold tracking-[0.18em] uppercase">
            Lab facilities
          </h3>
          <Stagger className="border-border grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-3">
            {about.facilities.map((facility) => {
              const Icon = facilityIcon(facility);
              return (
                <StaggerItem
                  key={facility}
                  className="border-border bg-background hover:bg-surface-2 flex items-center gap-4 border-r border-b p-6 transition-colors duration-(--dur-fast) ease-out"
                >
                  <span className="bg-primary-soft text-primary inline-flex size-11 shrink-0 items-center justify-center rounded-md">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{facility}</span>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}
