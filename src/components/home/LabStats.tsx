import { stats } from "@/data/stats";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stat } from "@/components/ui/Stat";
import { Reveal } from "@/components/motion/Reveal";

export function LabStats() {
  return (
    <Section tone="surface">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Lab highlights"
          title="Our work in numbers"
          subtitle="Placeholder figures that update as the lab grows."
        />
        <Reveal className="grid gap-5 sm:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Stat
                key={item.id}
                value={item.value}
                label={item.label}
                href={item.href}
                suffix={item.suffix}
                note={item.note}
                icon={<Icon className="size-7" aria-hidden="true" />}
              />
            );
          })}
        </Reveal>
      </Container>
    </Section>
  );
}
