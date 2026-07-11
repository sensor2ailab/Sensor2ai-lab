import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "danger";

const variants: Record<Variant, string> = {
  solid: "bg-primary text-on-primary hover:bg-primary-hover",
  outline:
    "border border-border bg-background text-secondary hover:border-primary hover:text-primary",
  danger:
    "border border-border bg-background text-muted hover:border-danger hover:bg-danger-soft hover:text-danger",
};

interface IconButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  busy?: boolean;
  disabled?: boolean;
}

// Square icon-only control. The `label` is the accessible name and also shows as a
// styled tooltip on hover/focus. Pass `busy` to show a spinner and disable it.
export function IconButton({
  label,
  icon: Icon,
  onClick,
  variant = "outline",
  className,
  type = "button",
  busy = false,
  disabled = false,
}: IconButtonProps) {
  const Glyph = busy ? Loader2 : Icon;
  return (
    <span className="group relative inline-flex">
      <button
        type={type}
        onClick={onClick}
        aria-label={label}
        disabled={disabled || busy}
        className={cn(
          "rounded-pill inline-flex size-10 items-center justify-center transition-[background-color,color,border-color] duration-(--dur-fast) ease-out focus-visible:outline-none disabled:opacity-60",
          variants[variant],
          className,
        )}
      >
        <Glyph className={cn("size-5", busy && "animate-spin")} aria-hidden="true" />
      </button>
      <span
        aria-hidden="true"
        className="bg-ink text-on-ink shadow-card pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-20 -translate-x-1/2 scale-95 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap opacity-0 transition-[opacity,transform] duration-(--dur-fast) ease-out group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:scale-100 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
