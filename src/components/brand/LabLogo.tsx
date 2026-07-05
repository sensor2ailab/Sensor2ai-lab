import { site } from "@/data/site";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/cn";

// Placeholder circular lab logo drawn as inline SVG. Swap for the real logo later.
export function LabLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${site.shortName} logo`}
      className={cn("shrink-0", className)}
    >
      <circle cx="60" cy="60" r="58" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="60" cy="60" r="44" fill="var(--accent)" />
      <circle
        cx="60"
        cy="60"
        r="37"
        fill="none"
        stroke="var(--on-primary)"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <text
        x="60"
        y="61"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--on-primary)"
        fontSize="28"
        fontWeight="800"
        fontFamily="var(--font-manrope)"
      >
        {initials(site.shortName)}
      </text>
    </svg>
  );
}
