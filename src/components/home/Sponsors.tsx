import { sponsors } from "@/data/sponsors";
import type { LogoItem } from "@/components/reactbits/LogoLoop";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LogoLoop } from "@/components/reactbits/LogoLoop";

// Each item pairs a placeholder mark with its name so the logo reads clearly.
// Real logos get swapped into src/data/sponsors.ts without touching this file.
const logos: LogoItem[] = sponsors.map((sponsor) => ({
  node: (
    <span className="flex flex-col items-center gap-3">
      {/* Vector SVG mark inside a width-measured marquee; next/image does not fit here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sponsor.logo}
        alt=""
        aria-hidden="true"
        width={80}
        height={80}
        className="h-20 w-auto shrink-0 object-contain"
      />
      <span className="font-display text-foreground text-lg font-semibold whitespace-nowrap">
        {sponsor.name}
      </span>
    </span>
  ),
  ariaLabel: sponsor.name,
  ...(sponsor.href.startsWith("http") ? { href: sponsor.href } : {}),
}));

export function Sponsors() {
  return (
    <Section tone="surface">
      <Container className="flex flex-col items-center justify-center gap-30">
        <SectionHeading
          eyebrow="Funding"
          title="Sponsors"
          subtitle="Our Research is supported by the following funding bodies."
        />
        <LogoLoop
          logos={logos}
          speed={60}
          gap={56}
          logoHeight={64}
          pauseOnHover
          scaleOnHover
          fadeOut
          ariaLabel="Research sponsors and funding bodies"
        />
      </Container>
    </Section>
  );
}
