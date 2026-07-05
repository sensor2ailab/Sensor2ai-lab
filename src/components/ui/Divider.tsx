import { cn } from "@/lib/cn";

// Thin token-colored rule.
export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-border border-0 border-t", className)} />;
}
