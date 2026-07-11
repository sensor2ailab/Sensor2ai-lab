"use client";

import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";

export interface BentoTile {
  id: string;
  label: string;
  value?: string | number;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  /** Highlights the tile (e.g. items still awaiting a reply). */
  accent?: boolean;
  /** Spans two columns on wide screens, for the lead tile. */
  wide?: boolean;
}

// A compact bento strip above the thread: a few at-a-glance tiles that stagger in and
// lift on hover. Stat tiles are static; tiles with an href become links.
export function ChatBento({ tiles }: { tiles: BentoTile[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile, i) => {
        const Icon = tile.icon;
        const body = (
          <>
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-md",
                tile.accent ? "bg-accent text-on-primary" : "bg-surface-2 text-primary",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
                {tile.label}
              </span>
              {tile.value !== undefined ? (
                <span className="text-foreground text-2xl font-extrabold tabular-nums">
                  {tile.value}
                </span>
              ) : null}
              {tile.hint ? <span className="text-secondary text-sm">{tile.hint}</span> : null}
            </span>
            {tile.href ? (
              <ArrowUpRight
                className="text-muted group-hover:text-primary size-4 shrink-0 transition-[color,transform] duration-(--dur-fast) ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            ) : null}
          </>
        );

        const shell = cn(
          "group border-border bg-background flex h-full items-center gap-3 rounded-lg border p-4",
          "transition-[border-color,box-shadow,transform] duration-(--dur-base) ease-out",
          "hover:border-primary hover:shadow-lift hover:-translate-y-0.5",
        );

        return (
          <m.div
            key={tile.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: easeOut, delay: reduce ? 0 : i * 0.05 }}
            className={cn("h-full", tile.wide && "col-span-2")}
          >
            {tile.href ? (
              <Link href={tile.href} className={shell}>
                {body}
              </Link>
            ) : (
              <div className={shell}>{body}</div>
            )}
          </m.div>
        );
      })}
    </div>
  );
}
