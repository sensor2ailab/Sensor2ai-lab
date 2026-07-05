import type { Metadata } from "next";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewsFeed } from "@/components/news/NewsFeed";

export const metadata: Metadata = {
  title: "News",
  description: `Latest news, acceptances, talks, and updates from the ${site.name}.`,
  alternates: { canonical: "/news" },
};

export const dynamic = "force-static";

export default function NewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Updates"
        title="News"
        subtitle="Acceptances, awards, talks, and announcements from across the lab."
      />
      <Section tone="surface">
        <Container>
          <NewsFeed />
        </Container>
      </Section>
    </>
  );
}
