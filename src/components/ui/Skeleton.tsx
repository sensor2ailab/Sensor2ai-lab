import { cn } from "@/lib/cn";

// Loading placeholder with a glare sweep (see `.skeleton` in globals.css). Size and
// shape come from className so it can stand in for any block.
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-lg", className)} />;
}
