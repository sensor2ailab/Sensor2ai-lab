"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Publication } from "@/lib/api-types";

// Add several tags to a publication at once. Type a tag and press Enter or comma to
// stage it as a chip; Save writes them all in a single request. Duplicates are
// dropped case-insensitively, both against the publication's existing tags and within
// the staged list.
export function AddTagsModal({
  pub,
  onClose,
  onSave,
}: {
  pub: Publication | null;
  onClose: () => void;
  onSave: (pub: Publication, newTags: string[]) => Promise<void>;
}) {
  const [pending, setPending] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  if (!pub) return null;

  const existingLower = new Set(pub.tags.map((t) => t.toLowerCase()));

  // Accepts comma-separated input; returns the merged, de-duplicated staged list.
  function stage(raw: string, base: string[]): string[] {
    const seen = new Set([...base.map((t) => t.toLowerCase()), ...existingLower]);
    const next = [...base];
    for (const part of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
      const low = part.toLowerCase();
      if (!seen.has(low)) {
        seen.add(low);
        next.push(part);
      }
    }
    return next;
  }

  function commitInput() {
    if (!input.trim()) return;
    setPending((prev) => stage(input, prev));
    setInput("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitInput();
    } else if (e.key === "Backspace" && !input && pending.length > 0) {
      setPending((prev) => prev.slice(0, -1));
    }
  }

  async function save() {
    if (!pub) return;
    // Fold in anything still in the input box.
    const all = stage(input, pending);
    if (all.length === 0) {
      toast.error("Add at least one tag.");
      return;
    }
    setBusy(true);
    try {
      await onSave(pub, all);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const stagedCount = stage(input, pending).length;

  return (
    <Modal open={Boolean(pub)} title="Add tags" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-secondary text-sm">
          Tag <span className="text-foreground font-medium">{pub.title}</span>. Press Enter or comma
          to add each tag, then save them together.
        </p>

        {pub.tags.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-muted text-xs font-semibold tracking-wide uppercase">
              Current tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pub.tags.map((t) => (
                <span
                  key={t}
                  className="bg-surface-2 text-secondary rounded-sm px-2 py-0.5 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="border-border focus-within:border-primary focus-within:ring-primary/25 flex flex-wrap items-center gap-1.5 rounded-md border p-2 transition-[border-color,box-shadow] duration-(--dur-fast) focus-within:ring-2">
          {pending.map((t) => (
            <span
              key={t}
              className="bg-primary-soft text-primary-hover inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium"
            >
              {t}
              <button
                type="button"
                onClick={() => setPending((prev) => prev.filter((x) => x !== t))}
                aria-label={`Remove ${t}`}
                className="hover:text-danger -mr-0.5"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={commitInput}
            maxLength={40}
            placeholder={pending.length ? "Add another…" : "e.g. edge-ml, wearables"}
            aria-label="New tag"
            className="text-foreground placeholder:text-muted min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
          />
        </div>

        <div className="mt-1 flex justify-end gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => void save()} loading={busy} disabled={stagedCount === 0}>
            {busy ? null : <Plus className="size-4" aria-hidden="true" />}
            Add {stagedCount > 0 ? stagedCount : ""} {stagedCount === 1 ? "tag" : "tags"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
