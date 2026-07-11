import Link from "next/link";
import { ArrowRight, CalendarDays, FolderGit2 } from "lucide-react";
import type { Project } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { projectStatusStyle } from "@/lib/project";

export function ProjectCard({ project }: { project: Project }) {
  const status = projectStatusStyle(project.status);
  return (
    <Card hover as="article" className="flex h-full flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="bg-primary-soft text-primary-hover inline-flex size-11 shrink-0 items-center justify-center rounded-md">
          <FolderGit2 className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-pill inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${status.pill}`}
          >
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            {project.status}
          </span>
          {project.period ? (
            <span className="text-muted inline-flex items-center gap-1 text-xs">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {project.period}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-h3 font-semibold">
          <Link
            href={`/projects/${project.slug}`}
            className="hover:text-primary transition-colors duration-(--dur-fast) ease-out"
          >
            {project.title}
          </Link>
        </h3>
        <p className="text-secondary line-clamp-2 text-sm">{project.blurb}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.funding.map((fund) => (
          <Badge key={fund} tone="outline">
            {fund}
          </Badge>
        ))}
      </div>

      <Link
        href={`/projects/${project.slug}`}
        className="border-border text-primary hover:text-primary-hover group mt-auto inline-flex items-center gap-1 border-t pt-4 text-sm font-medium transition-colors duration-(--dur-fast) ease-out"
      >
        View project
        <ArrowRight
          className="size-4 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </Card>
  );
}
