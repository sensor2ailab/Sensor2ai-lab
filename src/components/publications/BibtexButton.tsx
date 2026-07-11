"use client";

import { Check, Copy, Quote } from "lucide-react";
import { useState } from "react";

// Toggle a BibTeX entry and copy it to the clipboard.
export function BibtexButton({ bibtex }: { bibtex: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; the entry stays visible to copy manually.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="rounded-pill border-border text-secondary hover:border-primary hover:text-primary inline-flex w-fit items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors duration-(--dur-fast) ease-out"
      >
        <Quote className="size-3.5" aria-hidden="true" />
        BibTeX
      </button>

      {open ? (
        <div className="border-border bg-surface-2 relative rounded-md border">
          <pre className="text-secondary overflow-x-auto p-4 pr-14 text-xs leading-relaxed">
            {bibtex}
          </pre>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy BibTeX to clipboard"
            className="border-border bg-background text-secondary hover:border-primary hover:text-primary absolute top-2 right-2 inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs transition-colors duration-(--dur-fast) ease-out"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
