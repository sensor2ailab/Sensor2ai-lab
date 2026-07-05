import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  onNavigate?: () => void;
  variant?: "mark" | "word";
}

// "word" is a coral wordmark for the header; "mark" adds the monogram tile.
export function Logo({ className, onNavigate, variant = "mark" }: LogoProps) {
  if (variant === "word") {
    return (
      <Link
        href="/"
        onClick={onNavigate}
        aria-label={`${site.shortName} home`}
        className={cn(
          "font-display text-accent hover:text-accent-hover text-xl font-extrabold tracking-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
          className,
        )}
      >
        {site.shortName}
      </Link>
    );
  }

  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label={`${site.shortName} home`}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden="true"
        className="bg-accent font-display text-on-primary inline-flex size-9 items-center justify-center rounded-md text-sm font-bold"
      >
        Research
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-foreground text-base font-bold tracking-tight">
          {site.shortName}
        </span>
        <span className="text-muted text-xs">{site.instituteShort}</span>
      </span>
    </Link>
  );
}
