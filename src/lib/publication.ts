import type { Publication } from "@/lib/api-types";

// Friendly labels for common BibTeX entry types; unknown types are title-cased.
const TYPE_LABELS: Record<string, string> = {
  inproceedings: "Conference",
  conference: "Conference",
  article: "Journal",
  incollection: "Book chapter",
  inbook: "Book chapter",
  book: "Book",
  phdthesis: "Thesis",
  mastersthesis: "Thesis",
  techreport: "Report",
  patent: "Patent",
  misc: "Other",
};

export function pubTypeLabel(entryType: string | null): string {
  if (!entryType) return "Other";
  const key = entryType.toLowerCase();
  return TYPE_LABELS[key] ?? entryType.charAt(0).toUpperCase() + entryType.slice(1);
}

// Best external link for a paper: an explicit URL, else the DOI resolver.
export function pubUrl(pub: Publication): string | null {
  if (pub.url) return pub.url;
  if (pub.doi) return `https://doi.org/${pub.doi}`;
  return null;
}
