import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "surface" | "surface-2" | "ink";

const tones: Record<Tone, string> = {
  default: "bg-background text-foreground",
  surface: "bg-surface text-foreground",
  "surface-2": "bg-surface-2 text-foreground",
  ink: "bg-ink text-on-ink",
};

interface SectionProps {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  className?: string;
  as?: "section" | "div";
}

// Consistent vertical rhythm plus an optional surface background.
export function Section({
  children,
  id,
  tone = "default",
  className,
  as: Tag = "section",
}: SectionProps) {
  return (
    <Tag id={id} className={cn("py-16 sm:py-20 lg:py-24", tones[tone], className)}>
      {children}
    </Tag>
  );
}
