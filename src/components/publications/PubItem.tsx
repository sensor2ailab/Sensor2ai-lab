"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowUpRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { BibtexButton } from "@/components/publications/BibtexButton";
import { pubTypeLabel, pubUrl } from "@/lib/publication";
import { durBase, easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { Publication } from "@/lib/api-types";

interface Props {
  pub: Publication;
  isAdmin?: boolean;
  activeTags?: string[];
  onTagToggle?: (tag: string) => void;
  onOpenAddTags?: (pub: Publication) => void;
  onRemoveTag?: (pub: Publication, tag: string) => void;
  onEdit?: (pub: Publication) => void;
  onDelete?: (pub: Publication) => void;
}

const pillBase =
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium transition-colors duration-(--dur-fast) ease-out";

export function PubItem({
  pub,
  isAdmin,
  activeTags,
  onTagToggle,
  onOpenAddTags,
  onRemoveTag,
  onEdit,
  onDelete,
}: Props) {
  const link = pubUrl(pub);
  return (
    <article className="flex flex-col gap-3 py-6">
      {pub.authors.length ? (
        <p className="text-foreground text-sm font-semibold">{pub.authors.join(", ")}</p>
      ) : null}

      <h3 className="text-h3 font-semibold">
        {link ? (
          <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary inline-flex items-start gap-1 transition-colors duration-(--dur-fast) ease-out"
          >
            {pub.title}
            <ArrowUpRight className="mt-1 size-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          pub.title
        )}
      </h3>

      {pub.venue ? <p className="text-secondary text-sm">{pub.venue}</p> : null}

      {/* Type + DOI, then curator tags. Tags filter on click and, for admins, can be
          added or removed inline right next to the journal/type badge. */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{pubTypeLabel(pub.entryType)}</Badge>
        {pub.doi ? <Badge tone="outline">DOI</Badge> : null}

        {pub.tags.map((tag) => (
          <TagPill
            key={tag}
            tag={tag}
            active={activeTags?.includes(tag) ?? false}
            isAdmin={Boolean(isAdmin)}
            onToggle={() => onTagToggle?.(tag)}
            onRemove={() => onRemoveTag?.(pub, tag)}
          />
        ))}

        {isAdmin && onOpenAddTags ? (
          <button
            type="button"
            onClick={() => onOpenAddTags(pub)}
            className={cn(
              pillBase,
              "bg-primary text-on-primary hover:bg-primary-hover cursor-pointer",
            )}
          >
            <Plus className="size-3" aria-hidden="true" />
            Add tags
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <BibtexButton bibtex={pub.rawBibtex} />
        {isAdmin ? (
          <>
            <IconButton
              label="Edit publication"
              icon={Pencil}
              className="size-8"
              onClick={() => onEdit?.(pub)}
            />
            <IconButton
              label="Delete publication"
              icon={Trash2}
              variant="danger"
              className="size-8"
              onClick={() => onDelete?.(pub)}
            />
          </>
        ) : null}
      </div>
    </article>
  );
}

// A small anchored popover that pops in (scale + fade), dismisses on outside click
// or Escape, and keeps the trigger inside its container ref so re-clicks are stable.
function Pop({
  containerRef,
  onClose,
  label,
  align = "left",
  className,
  children,
}: {
  containerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  label: string;
  align?: "left" | "right";
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    function onDown(e: globalThis.MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [containerRef, onClose]);

  return (
    <m.div
      role="dialog"
      aria-label={label}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: reduce ? 0 : durBase, ease: easeOut }}
      className={cn(
        "border-border bg-background shadow-lift absolute top-full z-30 mt-2 rounded-md border p-3",
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className,
      )}
    >
      {children}
    </m.div>
  );
}

// One tag: click the label to filter; admins get a remove (×) that pops a small
// confirmation before deleting, matching the deliberate, formal tone of the board.
function TagPill({
  tag,
  active,
  isAdmin,
  onToggle,
  onRemove,
}: {
  tag: string;
  active: boolean;
  isAdmin: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  return (
    <span
      className={cn(
        pillBase,
        // At rest, tags read like the neutral type badge; as a filter they take the
        // accent, matching the filter-row chips.
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-2 text-secondary hover:bg-primary-soft hover:text-primary-hover",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        aria-label={`Filter by tag ${tag}`}
        className="cursor-pointer"
      >
        {tag}
      </button>
      {isAdmin ? (
        <span ref={wrapRef} className="relative inline-flex">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Remove tag ${tag}`}
            className={cn(
              "-mr-0.5 grid size-4 place-items-center rounded-full transition-colors duration-(--dur-fast)",
              active
                ? "text-on-primary/70 hover:text-on-primary hover:bg-on-primary/20"
                : "text-muted hover:text-foreground hover:bg-foreground/10",
            )}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
          <AnimatePresence>
            {confirming ? (
              <Pop
                containerRef={wrapRef}
                onClose={() => setConfirming(false)}
                label={`Remove tag ${tag}`}
                className="w-56"
              >
                <p className="text-secondary text-sm">
                  Remove <span className="text-foreground font-medium">{tag}</span>?
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="text-secondary hover:text-foreground rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-(--dur-fast)"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRemove();
                      setConfirming(false);
                    }}
                    className="bg-danger text-on-primary rounded-md px-2.5 py-1 text-xs font-medium transition-opacity duration-(--dur-fast) hover:opacity-90"
                  >
                    Remove
                  </button>
                </div>
              </Pop>
            ) : null}
          </AnimatePresence>
        </span>
      ) : null}
    </span>
  );
}
