"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { errorFromResponse } from "@/lib/api-error";
import type { Publication } from "@/lib/api-types";

interface Props {
  editing: Publication | null;
  onSaved: () => void;
  onCancel: () => void;
}

interface Preview {
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  entryType: string | null;
}

// Add: paste BibTeX (with an optional preview), then create. Edit: adjust the
// stored fields directly. Both talk to the publications endpoints via authFetch.
export function PublicationForm({ editing, onSaved, onCancel }: Props) {
  const { authFetch } = useAuth();
  const [busy, setBusy] = useState(false);

  // Add-mode state.
  const [rawBibtex, setRawBibtex] = useState("");
  const [linkOrDoi, setLinkOrDoi] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // Edit-mode state.
  const [title, setTitle] = useState(editing?.title ?? "");
  const [authors, setAuthors] = useState(editing?.authors.join(", ") ?? "");
  const [year, setYear] = useState(editing?.year ? String(editing.year) : "");
  const [venue, setVenue] = useState(editing?.venue ?? "");
  const [doi, setDoi] = useState(editing?.doi ?? "");
  const [url, setUrl] = useState(editing?.url ?? "");

  async function runPreview() {
    if (!rawBibtex.trim()) return;
    setPreviewing(true);
    setPreview(null);
    try {
      const res = await authFetch("/publications/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawBibtex: rawBibtex.trim() }),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res, "Could not parse that BibTeX."));
        return;
      }
      const body = (await res.json()) as { preview: Preview };
      setPreview(body.preview);
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setPreviewing(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      let res: Response;
      if (editing) {
        const payload = {
          title: title.trim(),
          authors: authors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
          year: year.trim() ? Number(year) : null,
          venue: venue.trim() ? venue.trim() : null,
          doi: doi.trim() ? doi.trim() : null,
          url: url.trim() ? url.trim() : null,
        };
        res = await authFetch(`/publications/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // BibTeX and a DOI/link are both required; BibTeX rarely carries a link.
        const link = linkOrDoi.trim();
        if (!rawBibtex.trim()) {
          toast.error("Paste a BibTeX entry.");
          return;
        }
        if (!link) {
          toast.error("Add a DOI or publication link.");
          return;
        }
        const isUrl = /^https?:\/\//i.test(link);
        res = await authFetch("/publications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawBibtex: rawBibtex.trim(),
            ...(isUrl ? { url: link } : { doi: link }),
          }),
        });
      }
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      toast.success(editing ? "Publication updated" : "Publication added");
      onSaved();
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {editing ? (
        <>
          <Field label="Title" htmlFor="pub-title" required>
            <Input
              id="pub-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Authors" htmlFor="pub-authors" hint="Comma separated, in order.">
            <Input
              id="pub-authors"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="Ada Lovelace, Alan Turing"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Year" htmlFor="pub-year">
              <Input
                id="pub-year"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
              />
            </Field>
            <Field label="Venue" htmlFor="pub-venue">
              <Input
                id="pub-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="ACM CHI"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="DOI" htmlFor="pub-doi">
              <Input
                id="pub-doi"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="10.1145/..."
              />
            </Field>
            <Field label="URL" htmlFor="pub-url">
              <Input
                id="pub-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>
        </>
      ) : (
        <>
          <Field
            label="BibTeX"
            htmlFor="pub-bibtex"
            required
            hint="Paste one entry. We parse the title, authors, year, and venue automatically."
          >
            <Textarea
              id="pub-bibtex"
              required
              value={rawBibtex}
              onChange={(e) => {
                setRawBibtex(e.target.value);
                setPreview(null);
              }}
              className="min-h-40 font-mono text-xs"
              placeholder={
                "@inproceedings{key2026,\n  title={...},\n  author={...},\n  year={2026}\n}"
              }
            />
          </Field>
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => void runPreview()}>
              {previewing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              Preview
            </Button>
          </div>
          {preview ? (
            <div className="border-border bg-surface-2/50 flex flex-col gap-1 rounded-md border p-3 text-sm">
              <p className="text-foreground font-semibold">{preview.title || "Untitled"}</p>
              <p className="text-secondary">{preview.authors.join(", ") || "Unknown authors"}</p>
              <p className="text-muted text-xs">
                {[preview.venue, preview.year].filter(Boolean).join(" · ") || "No venue/year"}
              </p>
            </div>
          ) : null}

          <Field
            label="DOI or publication link"
            htmlFor="pub-link"
            required
            hint="BibTeX usually omits this. Paste a DOI (10.1145/...) or a full URL."
          >
            <Input
              id="pub-link"
              required
              value={linkOrDoi}
              onChange={(e) => setLinkOrDoi(e.target.value)}
              placeholder="10.1145/... or https://..."
            />
          </Field>
        </>
      )}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {editing ? "Save changes" : "Add publication"}
        </Button>
      </div>
    </form>
  );
}
