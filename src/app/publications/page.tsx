import type { Metadata } from "next";
import { site } from "@/data/site";
import { ScholarIcon } from "@/components/brand/SocialIcons";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { PublicationsBoard } from "@/components/publications/PublicationsBoard";

export const metadata: Metadata = {
  title: "Publications",
  description: `Peer-reviewed papers, journals, and patents from the ${site.name}.`,
  alternates: { canonical: "/publications" },
};

export const dynamic = "force-static";

export default function PublicationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research output"
        title="Publications"
        subtitle="Conference papers, journal articles, book chapters, and patents. Filter by type or field."
      >
        <Button href={site.social.scholar} external variant="secondary" size="sm">
          <ScholarIcon className="size-4" />
          Google Scholar
        </Button>
      </PageHeader>
      <Section className="bg-surface">
        <Container>
          <PublicationsBoard />
        </Container>
      </Section>
    </>
  );
}
