import { news } from "@/data/news";
import { Hero } from "@/components/home/Hero";
import { Welcome } from "@/components/home/Welcome";
import { HighlightsBento } from "@/components/home/HighlightsBento";
import { Achievements } from "@/components/home/Achievements";
import { AboutSection } from "@/components/home/AboutSection";
import { ResearchAreas } from "@/components/home/ResearchAreas";
import { LabStats } from "@/components/home/LabStats";
import { Collaborators } from "@/components/home/Collaborators";
import { Sponsors } from "@/components/home/Sponsors";
import { CtaBand } from "@/components/home/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Welcome />

      <HighlightsBento
        eyebrow="Recent highlights"
        title="The latest from our Research"
        items={news}
      />

      <Achievements />
      <AboutSection />
      <ResearchAreas />
      <LabStats />
      <Collaborators />
      <Sponsors />
      <CtaBand />
    </>
  );
}
