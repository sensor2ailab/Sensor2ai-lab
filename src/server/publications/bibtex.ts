import { parse } from "@retorquere/bibtex-parser";
import { z } from "zod";
import { Errors } from "@/server/http/errors";

export interface ParsedPublication {
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
}

// DOIs look like 10.NNNN/suffix. Kept permissive but anchored.
export const doiSchema = z
  .string()
  .trim()
  .regex(/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/i, "Invalid DOI format");

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const t = value.trim();
    return t.length ? t : null;
  }
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    const t = (value as string[]).join(", ").trim();
    return t.length ? t : null;
  }
  return null;
}

function asAuthors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): string => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const o = entry as { firstName?: string; lastName?: string; name?: string };
        if (o.name) return o.name;
        return [o.firstName, o.lastName].filter(Boolean).join(" ");
      }
      return "";
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

// Parses a single BibTeX entry into normalized fields. Title case is preserved.
export function parseBibtex(raw: string): ParsedPublication {
  let entries;
  try {
    entries = parse(raw, { sentenceCase: false }).entries;
  } catch {
    throw Errors.badRequest("Could not parse the BibTeX input");
  }
  const entry = entries[0];
  if (!entry) throw Errors.badRequest("No BibTeX entry found in the input");

  const f = entry.fields;
  const title = asString(f.title);
  if (!title) throw Errors.badRequest("BibTeX entry is missing a title");

  const yearRaw = asString(f.year);
  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;

  return {
    entryType: entry.type ?? null,
    bibtexKey: entry.key ?? null,
    title,
    authors: asAuthors(f.author),
    year,
    venue: asString(f.journal) ?? asString(f.booktitle) ?? null,
    volume: asString(f.volume),
    number: asString(f.number),
    pages: asString(f.pages),
    publisher: asString(f.publisher),
    doi: asString(f.doi),
    url: asString(f.url),
    abstract: asString(f.abstract),
    rawBibtex: raw,
  };
}
