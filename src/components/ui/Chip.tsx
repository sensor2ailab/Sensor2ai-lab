import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const baseChip =
  "inline-flex items-center gap-2 rounded-pill border px-3.5 py-1.5 text-sm transition-[background-color,color,border-color] duration-(--dur-fast) ease-out";

interface StaticChipProps {
  children: ReactNode;
  className?: string;
  active?: never;
  onClick?: never;
}

interface ButtonChipProps {
  children: ReactNode;
  className?: string;
  active: boolean;
  onClick: () => void;
}

type ChipProps = StaticChipProps | ButtonChipProps;

// Static token when used for labels; a toggle button when given onClick (filters).
export function Chip(props: ChipProps) {
  const { children, className } = props;

  if ("onClick" in props && props.onClick) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        aria-pressed={props.active}
        className={cn(
          baseChip,
          // Active fill uses `primary` (AA-safe, ~5.2:1 with white). `accent` is brighter
          // but only clears AA as large text, so it can't back small chip labels.
          props.active
            ? "border-primary bg-primary text-on-primary"
            : "border-border bg-background text-secondary hover:border-primary hover:text-primary",
          className,
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={cn(baseChip, "border-border bg-background text-secondary", className)}>
      {children}
    </span>
  );
}
