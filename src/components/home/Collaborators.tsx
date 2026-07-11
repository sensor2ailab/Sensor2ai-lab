import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { collaborators } from "@/data/collaborators";
import { initials } from "@/lib/initials";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function Collaborators() {
  return (
    <Section>
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Network"
          title="Collaborators"
          subtitle="Institutions we work with across research and clinical partnerships."
        />
        <Stagger className="border-border grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-4">
          {collaborators.map((item) => {
            const external = item.href.startsWith("http");
            return (
              <StaggerItem key={item.name} className="h-full">
                <Link
                  href={item.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="border-border bg-background hover:bg-surface-2 group flex h-full flex-col gap-4 border-r border-b p-6 transition-colors duration-(--dur-fast) ease-out"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="bg-surface-2 font-display text-secondary group-hover:bg-primary-soft group-hover:text-primary inline-flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-(--dur-fast) ease-out"
                    >
                      {initials(item.name, 3)}
                    </span>
                    <ArrowUpRight
                      className="text-muted size-4 shrink-0 opacity-0 transition-[opacity,transform] duration-(--dur-fast) ease-out group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-auto flex flex-col gap-1">
                    <span className="text-foreground leading-tight font-semibold">{item.name}</span>
                    <span className="text-muted inline-flex items-center gap-1 text-xs">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      {item.location}
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
