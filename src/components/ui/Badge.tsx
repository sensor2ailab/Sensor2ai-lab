import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "success" | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-secondary",
  primary: "bg-primary-soft text-primary-hover",
  success: "bg-primary-soft text-success",
  outline: "border border-border text-secondary",
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

// Small inline label for tags, tracks, awards, and status.
export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
