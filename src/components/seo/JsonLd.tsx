import { site } from "@/data/site";

// Structured data describing the lab as a Research organization.
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    description: site.description,
    email: site.email,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: site.institute,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Patna",
      addressRegion: "Bihar",
      addressCountry: "IN",
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
