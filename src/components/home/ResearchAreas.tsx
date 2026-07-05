import { researchAreas } from "@/data/research-areas";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function ResearchAreas() {
  return (
    <Section>
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="What we do"
          title="Research areas"
          subtitle="Six directions that shape our work across systems, sensing, and human-centered computing."
        />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {researchAreas.map((area) => {
            const Icon = area.icon;
            return (
              <StaggerItem key={area.id} className="h-full">
                <Card hover className="flex h-full flex-col gap-4 p-7">
                  <span className="bg-primary-soft text-primary-hover inline-flex size-11 items-center justify-center rounded-md">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-h3 font-semibold">{area.title}</h3>
                  <p className="text-secondary">{area.description}</p>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
