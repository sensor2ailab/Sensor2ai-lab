import type { Metadata } from "next";
import { projects } from "@/data/projects";
import type { ProjectStatus } from "@/types";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { GridBackdrop } from "@/components/layout/GridBackdrop";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "Projects",
  description: `Ongoing and completed Research projects at the ${site.name}.`,
  alternates: { canonical: "/projects" },
};

export const dynamic = "force-static";

const groups: { status: ProjectStatus; title: string }[] = [
  { status: "Ongoing Research", title: "Ongoing Research Efforts" },
  { status: "Ongoing/Approved", title: "Ongoing and Approved Projects" },
  { status: "Completed", title: "Completed Projects" },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Projects"
        subtitle="Our funded and ongoing Research efforts across sensing, edge intelligence, and health."
      />
      <Section className="relative overflow-hidden">
        <GridBackdrop />
        <Container className="relative -mt-10 flex flex-col gap-16">
          {groups.map((group) => {
            const items = projects.filter((project) => project.status === group.status);
            if (items.length === 0) return null;
            return (
              <div key={group.status} className="flex flex-col gap-8">
                <div className="border-border flex flex-col gap-1 border-b pb-4">
                  <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                    {items.length} {items.length === 1 ? "project" : "projects"}
                  </span>
                  <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] text-balance">{group.title}</h2>
                </div>
                <ProjectGrid projects={items} />
              </div>
            );
          })}
        </Container>
      </Section>
      <CtaBand
        title="Have an idea to collaborate on?"
        subtitle="We are open to new Research collaborations and student projects."
      />
    </>
  );
}
