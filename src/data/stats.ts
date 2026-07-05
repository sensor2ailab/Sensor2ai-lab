import { FileText, FolderGit2, Users } from "lucide-react";
import type { StatItem } from "@/types";

// Highlight counters shown on the home page. Values and notes are placeholders.
export const stats: StatItem[] = [
  {
    id: "publications",
    label: "Publications",
    value: 48,
    suffix: "+",
    href: "/publications",
    icon: FileText,
    note: "In leading venues including PerCom, COMSNETS, BuildSys, and CHASE.",
  },
  {
    id: "projects",
    label: "Funded Projects",
    value: 9,
    suffix: "+",
    href: "/projects",
    icon: FolderGit2,
    note: "Backed by Google, DRDO, SERB, and industry partners.",
  },
  {
    id: "researchers",
    label: "Researchers",
    value: 18,
    suffix: "+",
    href: "/team",
    icon: Users,
    note: "PhD, MTech, and research staff working across the lab.",
  },
];
