import { cn } from "@/lib/cn";

// Decorative faded grid layer. Drop into a `relative` section to fill an empty
// background; it never intercepts clicks and is hidden from assistive tech.
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid-backdrop pointer-events-none absolute inset-0", className)}
    />
  );
}
