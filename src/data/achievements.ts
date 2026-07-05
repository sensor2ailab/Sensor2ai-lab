import { Award, GraduationCap, Plane, Trophy } from "lucide-react";
import type { Achievement } from "@/types";

// Placeholder recent achievements for the home page.
export const achievements: Achievement[] = [
  {
    id: "chi-2026",
    title: "Honorable Mention",
    detail: "Full paper recognized among the top submissions.",
    venue: "ACM CHI 2026",
    icon: Award,
  },
  {
    id: "sensys-2026",
    title: "Full paper accepted",
    detail: "Work on on-device sensing accepted to the main track.",
    venue: "ACM SenSys 2026",
    icon: Trophy,
  },
  {
    id: "travel-grant-2026",
    title: "Student travel grant",
    detail: "Awarded to a PhD scholar to present at the venue.",
    venue: "PerCom 2026",
    icon: Plane,
  },
  {
    id: "Research-award-2025",
    title: "Academic Research Award",
    detail: "Placeholder award recognizing the lab's Research direction.",
    venue: "2025",
    icon: GraduationCap,
  },
];
