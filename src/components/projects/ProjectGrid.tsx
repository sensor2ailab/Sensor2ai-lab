import type { Project } from "@/types";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MountStagger, MountStaggerItem } from "@/components/motion/Stagger";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <MountStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <MountStaggerItem key={project.slug} className="h-full">
          <ProjectCard project={project} />
        </MountStaggerItem>
      ))}
    </MountStagger>
  );
}
