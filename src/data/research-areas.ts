import { Activity, Cpu, HeartPulse, MousePointerClick, Navigation, Radio } from "lucide-react";
import type { ResearchArea } from "@/types";

// Placeholder Research directions, aligned with the lab's broad theme.
export const researchAreas: ResearchArea[] = [
  {
    id: "ubiquitous-computing",
    title: "Ubiquitous Computing",
    description: "Sensing and computation woven into everyday environments and devices.",
    icon: Activity,
  },
  {
    id: "edge-aiot",
    title: "Edge Computing & AIoT",
    description: "On-device intelligence for low-latency, privacy-preserving IoT systems.",
    icon: Cpu,
  },
  {
    id: "human-centered-interfaces",
    title: "Human-Centered Interfaces",
    description: "Interaction techniques that keep people at the center of computing.",
    icon: MousePointerClick,
  },
  {
    id: "smart-health",
    title: "Smart Health",
    description: "Wearable and ambient sensing for continuous, proactive healthcare.",
    icon: HeartPulse,
  },
  {
    id: "autonomous-systems",
    title: "Autonomous Systems",
    description: "Perception and decision-making for robots and connected machines.",
    icon: Navigation,
  },
  {
    id: "wireless-sensor-networks",
    title: "Wireless & Sensor Networks",
    description: "Reliable, energy-aware communication across large device fleets.",
    icon: Radio,
  },
];
