"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";

const DISMISS_KEY = "hiring-dismissed";

// Dark announcement bar shown at the very top only while there are open positions.
// On dismiss it collapses its height with a grid-rows transition, and the hero grows
// to fill the freed space in sync (see the :has() rule in globals.css). The dismissal
// is remembered for the session so it does not reappear on navigation or reload.
export function HiringBanner() {
  const [hasOpenings, setHasOpenings] = useState<boolean | null>(null);
  // Read the session dismissal up front. Safe from hydration mismatch: the banner
  // renders collapsed on the first pass either way (hasOpenings is still unknown).
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let active = true;
    // The public jobs endpoint already returns only open positions; the banner shows
    // only when at least one of them is flagged urgent.
    fetch("/api/v1/jobs")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((b: { items?: { urgent?: boolean }[] }) => {
        if (active) setHasOpenings((b.items ?? []).some((j) => j.urgent));
      })
      .catch(() => {
        if (active) setHasOpenings(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // storage may be unavailable (private mode); dismissal still holds for this view.
    }
  }

  if (!site.hiring.live) return null;

  // Collapsed until we confirm there are open roles, and after the user dismisses it.
  const collapsed = dismissed || hasOpenings !== true;

  return (
    <div
      data-dismissed={collapsed || undefined}
      className="hiring-banner grid grid-rows-[1fr] transition-[grid-template-rows] duration-(--dur-base) ease-out data-dismissed:grid-rows-[0fr] motion-reduce:transition-none"
    >
      <div className="min-h-0 overflow-hidden">
        <aside
          aria-label="Hiring announcement"
          inert={collapsed || undefined}
          className="border-border bg-primary-soft text-foreground relative flex h-11 items-center justify-center border-b"
        >
          <div className="mx-auto flex items-center justify-center gap-x-3 px-10 text-sm">
            <span className="relative flex size-2 shrink-0" aria-hidden="true">
              <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-accent relative inline-flex size-2 rounded-full" />
            </span>

            <p className="truncate text-center">
              <span className="font-bold">We are hiring.</span>{" "}
              <span className="text-secondary hidden sm:inline">{site.hiring.message}</span>
            </p>

            <Link
              href={site.hiring.href}
              className="group text-primary hover:text-primary-hover inline-flex shrink-0 items-center gap-1 font-bold transition-colors duration-(--dur-fast) ease-out"
            >
              {site.hiring.cta}
              <ArrowRight
                className="size-4 transition-transform duration-(--dur-fast) ease-out group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss hiring announcement"
            className="rounded-pill text-muted hover:bg-surface-2 hover:text-foreground absolute right-3 inline-flex size-6 items-center justify-center transition-colors duration-(--dur-fast) ease-out"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </aside>
      </div>
    </div>
  );
}
