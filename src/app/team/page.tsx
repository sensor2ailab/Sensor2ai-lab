import type { Metadata } from "next";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { GridBackdrop } from "@/components/layout/GridBackdrop";
import { TeamTabs } from "@/components/team/TeamTabs";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "Team",
  description: `Meet the faculty, Researchers, and students of the ${site.name} at ${site.instituteShort}.`,
  alternates: { canonical: "/team" },
};

export const dynamic = "force-static";

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Our team"
        subtitle="Faculty, Researchers, and students working together across systems, sensing, and human-centered computing."
      />
      <Section className="relative overflow-hidden">
        <GridBackdrop />
        <Container className="relative">
          <TeamTabs />
        </Container>
      </Section>
      <CtaBand
        title="Want to work with us?"
        subtitle="We welcome students, Researchers, and collaborators across our areas."
      />
    </>
  );
}
