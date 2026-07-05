import type { ProjectStatus } from "@/types";

// Pill + dot colors for a project's status, so the badge reads consistently on the
// list and detail views. Completed work is green; anything ongoing is the accent.
export function projectStatusStyle(status: ProjectStatus): { pill: string; dot: string } {
  if (status === "Completed") {
    return { pill: "bg-success-soft text-success", dot: "bg-success" };
  }
  return { pill: "bg-primary-soft text-primary-hover", dot: "bg-primary" };
}
