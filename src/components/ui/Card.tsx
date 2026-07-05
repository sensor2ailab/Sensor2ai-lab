import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "li";
}

// Surface card. On hover a running gradient border (see .running-border in
// globals.css) travels around the edge in the theme colors; with `hover` it also
// lifts on transform only. Pure CSS, so this stays a server component.
export function Card({ children, className, hover = false, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={cn(
        "running-border border-border bg-background shadow-card relative rounded-lg border",
        hover &&
          "hover:shadow-lift transition-[transform,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out)] will-change-transform hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
