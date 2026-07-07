"use client";

import { team } from "@/data/team";
import type { TeamGroup as TeamGroupType } from "@/types";
import { Tabs } from "@/components/ui/Tabs";
import { TeamGroup } from "@/components/team/TeamGroup";

function Groups({ groups }: { groups: TeamGroupType[] }) {
  return (
    <div className="flex flex-col gap-14">
      {groups.map((group) => (
        <TeamGroup key={group.id} group={group} />
      ))}
    </div>
  );
}

// Current vs Alumni, with animated tabs from the shared Tabs component.
export function TeamTabs() {
  return (
    <Tabs
      items={[
        { id: "current", label: "Current Team", content: <Groups groups={team.current} /> },
        { id: "interns", label: "Interns", content: <Groups groups={team.interns} /> },
        { id: "alumni", label: "Alumni & Past Members", content: <Groups groups={team.alumni} /> },
      ]}
    />
  );
}
