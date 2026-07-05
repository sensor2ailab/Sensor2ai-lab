import { achievements } from "@/data/achievements";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function Achievements() {
  return (
    <Section>
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Recognition"
          title="Latest achievements"
          subtitle="A snapshot of recent awards, acceptances, and milestones from the lab."
        />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.id} className="h-full">
                <Card hover className="flex h-full flex-col gap-3 p-6">
                  <span className="bg-primary-soft text-primary-hover inline-flex size-10 items-center justify-center rounded-md">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-h3 font-semibold">{item.title}</h3>
                  <p className="text-secondary text-sm">{item.detail}</p>
                  {item.venue ? (
                    <Badge tone="outline" className="mt-auto w-fit">
                      {item.venue}
                    </Badge>
                  ) : null}
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
