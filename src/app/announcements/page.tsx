import type { Metadata } from "next";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnnouncementsBoard } from "@/components/announcements/AnnouncementsBoard";

export const metadata: Metadata = {
  title: "Announcements",
  description: `Official announcements, calls, and notices from the ${site.name}.`,
  alternates: { canonical: "/announcements" },
};

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Notice board"
        title="Announcements"
        subtitle="Official calls, opportunities, and notices from the lab, updated in real time."
      />
      <Section tone="surface">
        <Container>
          <AnnouncementsBoard />
        </Container>
      </Section>
    </>
  );
}
