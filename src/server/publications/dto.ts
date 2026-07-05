import type { Publication } from "@prisma/client";

export interface PublicationDto {
  id: string;
  entryType: string | null;
  bibtexKey: string | null;
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  volume: string | null;
  number: string | null;
  pages: string | null;
  publisher: string | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  rawBibtex: string;
  createdAt: string;
  updatedAt: string;
}

export function toPublicationDto(pub: Publication): PublicationDto {
  return {
    id: pub.id,
    entryType: pub.entryType,
    bibtexKey: pub.bibtexKey,
    title: pub.title,
    authors: Array.isArray(pub.authors) ? (pub.authors as string[]) : [],
    year: pub.year,
    venue: pub.venue,
    volume: pub.volume,
    number: pub.number,
    pages: pub.pages,
    publisher: pub.publisher,
    doi: pub.doi,
    url: pub.url,
    abstract: pub.abstract,
    rawBibtex: pub.rawBibtex,
    createdAt: pub.createdAt.toISOString(),
    updatedAt: pub.updatedAt.toISOString(),
  };
}
