"use client";

import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { ArrowUpRight, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { news } from "@/data/news";
import { durBase, easeOut } from "@/lib/motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export function NewsFeed() {
  const reduce = useReducedMotion();
  const [year, setYear] = useState<string>("All");

  const years = useMemo(
    () => [
      "All",
      ...Array.from(new Set(news.map((item) => item.year)))
        .sort((a, b) => b - a)
        .map(String),
    ],
    [],
  );

  const filtered = useMemo(
    () => (year === "All" ? news : news.filter((item) => String(item.year) === year)),
    [year],
  );

  const grid = (
    <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((item) => (
        <li key={item.id} className="h-full">
          <Card hover as="article" className="flex h-full flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <Badge tone={item.highlighted ? "primary" : "outline"}>{item.venue}</Badge>
              <time className="text-muted text-xs font-medium">{item.date}</time>
            </div>

            <h2 className="text-h3 font-semibold">{item.title}</h2>

            {item.people?.length ? (
              <p className="text-secondary inline-flex items-start gap-2 text-sm">
                <Users className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{item.people.join(", ")}</span>
              </p>
            ) : null}

            {item.href ? (
              <Link
                href={item.href}
                className="group text-primary hover:text-primary-hover mt-auto inline-flex w-fit items-center gap-1 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
              >
                Read more
                <ArrowUpRight
                  className="size-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ) : null}
          </Card>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted mr-1 text-sm font-medium">Year</span>
          {years.map((option) => (
            <Chip key={option} active={option === year} onClick={() => setYear(option)}>
              {option}
            </Chip>
          ))}
        </div>
        <p className="text-muted text-sm">
          {filtered.length} {filtered.length === 1 ? "update" : "updates"}
        </p>
      </div>

      {reduce ? (
        grid
      ) : (
        <m.div
          key={year}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durBase, ease: easeOut }}
        >
          {grid}
        </m.div>
      )}
    </div>
  );
}
