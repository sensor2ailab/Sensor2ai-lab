import type { TeamGroup as TeamGroupType } from "@/types";
import { PersonCard } from "@/components/team/PersonCard";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

// One team section: heading with a count, then a responsive grid of profile cards
// (one, two, then three across).
export function TeamGroup({ group }: { group: TeamGroupType }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-h3 font-semibold sm:text-2xl">{group.title}</h2>
        <span className="text-muted text-sm">{group.members.length}</span>
      </div>
      <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {group.members.map((member) => (
          <StaggerItem key={member.name} className="h-full">
            <PersonCard person={member} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
