import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Cpu,
  Landmark,
  Mic,
  Radio,
  Users,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { NewsItem } from "@/types";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { LetterReveal } from "@/components/motion/LetterReveal";

interface HighlightsBentoProps {
  eyebrow: string;
  title: string;
  items: NewsItem[];
}

// A lucide icon per item, chosen from the venue and title so cells read at a glance.
function iconFor(item: NewsItem): LucideIcon {
  const text = `${item.venue} ${item.title}`.toLowerCase();
  if (text.includes("fund")) return Landmark;
  if (text.includes("imwut") || text.includes("journal") || text.includes("published"))
    return BookOpenText;
  if (text.includes("welcome") || text.includes("cohort") || text.includes("lab news"))
    return Users;
  if (text.includes("talk") || text.includes("presents") || text.includes("comsnets")) return Mic;
  if (text.includes("chi")) return Waypoints;
  if (text.includes("icdcn")) return Cpu;
  return Radio;
}

// Desktop (6x4) placements: highlight cells ring the centred heading, the rest stay
// empty for the airy grid look. Below lg everything stacks into two columns.
const HIGHLIGHT_CELLS = [
  "lg:col-start-2 lg:row-start-1",
  "lg:col-start-5 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-6 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-6 lg:row-start-3",
  "lg:col-start-2 lg:row-start-4",
  "lg:col-start-5 lg:row-start-4",
];
const EMPTY_CELLS = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-4 lg:row-start-1",
  "lg:col-start-6 lg:row-start-1",
  "lg:col-start-1 lg:row-start-4",
  "lg:col-start-3 lg:row-start-4",
  "lg:col-start-4 lg:row-start-4",
  "lg:col-start-6 lg:row-start-4",
];

// Grid lines come from each cell's right/bottom border plus the top/bottom on the grid.
// Every cell shares the same hover wash; only the filled cells are links (pointer).
const CELL =
  "border-border border-r border-b transition-colors duration-(--dur-fast) ease-out hover:bg-surface";

export function HighlightsBento({ eyebrow, title, items }: HighlightsBentoProps) {
  const cells = items.slice(0, HIGHLIGHT_CELLS.length);

  return (
    <Section tone="default">
      {/* Full-bleed grid: side cells sit at the screen edges like the reference. */}
      <Reveal className="border-border grid grid-cols-2 border-y lg:min-h-144 lg:grid-cols-6 lg:grid-rows-4">
        <div className="border-border col-span-2 flex flex-col items-center justify-center gap-4 border-r border-b p-8 text-center lg:col-start-2 lg:col-end-6 lg:row-start-2 lg:row-end-4">
          <span className="text-muted text-xs font-semibold tracking-[0.22em] uppercase">
            {eyebrow}
          </span>
          <h2 className="text-[clamp(1.6rem,4.5vw,2.75rem)] font-extrabold text-balance">
            <LetterReveal text={title} />
          </h2>
        </div>

        {cells.map((item, i) => {
          const Icon = iconFor(item);
          return (
            <Link
              key={item.id}
              href={item.href ?? "/news"}
              className={`${CELL} group relative flex min-h-36 cursor-pointer items-center justify-center p-4 text-center ${HIGHLIGHT_CELLS[i]}`}
            >
              {/* Resting state: icon and venue. */}
              <span className="flex flex-col items-center gap-3 transition-opacity duration-(--dur-base) ease-out group-hover:opacity-0">
                <span className="bg-foreground text-background inline-flex size-11 items-center justify-center rounded-full">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-secondary text-xs font-semibold tracking-[0.15em] uppercase">
                  {item.venue}
                </span>
              </span>

              {/* Hover state: the full highlight plus a read-more affordance. */}
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 opacity-0 transition-opacity duration-(--dur-base) ease-out group-hover:opacity-100">
                <span className="text-foreground line-clamp-3 text-sm font-medium text-balance">
                  {item.title}
                </span>
                <span className="rounded-pill border-primary text-primary inline-flex items-center gap-1 border px-3 py-1 text-xs font-semibold">
                  Read more
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </span>
            </Link>
          );
        })}

        {EMPTY_CELLS.map((pos) => (
          <div key={pos} aria-hidden="true" className={`${CELL} hidden lg:block ${pos}`} />
        ))}
      </Reveal>
    </Section>
  );
}
