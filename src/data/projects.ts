import type { Project } from "@/types";

// Placeholder projects. "sensepod" detail page is required, others round out the
// index across the three status groups.

export const projects: Project[] = [
  {
    slug: "sensepod",
    title: "SensePod",
    blurb: "A modular platform for ambient health sensing in homes and clinics.",
    status: "Ongoing Research",
    funding: ["Science & Technology Board", "Industry Partner Fund"],
    period: "2024 to present",
    overview:
      "SensePod is a modular hardware and software platform for continuous ambient health sensing. It combines low-power sensor nodes with on-device inference so that meaningful health signals can be captured without cameras or wearables, keeping data private and local.",
    objectives: [
      "Design low-power sensor nodes that run inference on-device",
      "Build a privacy-preserving pipeline that keeps raw data on the edge",
      "Validate ambient sensing against clinical reference measurements",
    ],
    outcomes: [
      "Reference platform deployed across the lab testbed",
      "Full paper at ACM SenSys 2024",
      "Open dataset of anonymized ambient signals (placeholder)",
    ],
    team: ["Dr. Ananya Verma", "Arjun Mehta", "Meera Joshi"],
  },
  {
    slug: "edgemind",
    title: "EdgeMind",
    blurb: "Communication-efficient federated learning for edge device fleets.",
    status: "Ongoing/Approved",
    funding: ["National Research Council"],
    period: "2025 to present",
    overview:
      "EdgeMind studies how large fleets of edge devices can learn shared models without moving raw data off-device. The project focuses on reducing communication cost while preserving model quality under real network conditions.",
    objectives: [
      "Reduce communication overhead in federated training",
      "Handle unreliable, intermittent device connectivity",
      "Preserve accuracy under non-uniform data across devices",
    ],
    outcomes: [
      "Prototype federated training scheduler",
      "Journal paper in IEEE Transactions on Mobile Computing 2025",
    ],
    team: ["Dr. Ananya Verma", "Nisha Gupta", "Dr. Rohan Iyer"],
  },
  {
    slug: "locatex",
    title: "LocateX",
    blurb: "Robust indoor localization using commodity wireless signals.",
    status: "Ongoing/Approved",
    funding: ["Innovation Grants Council"],
    period: "2024 to present",
    overview:
      "LocateX builds accurate indoor localization from signals already present in commodity wireless hardware, avoiding dedicated infrastructure. The aim is a system that stays robust as environments change.",
    objectives: [
      "Localize devices without dedicated beacons",
      "Stay accurate as furniture and layouts change",
      "Run in real time on constrained hardware",
    ],
    outcomes: ["Full paper at IEEE PerCom 2026", "Field trials across the department testbed"],
    team: ["Dr. Ananya Verma", "Kabir Rao"],
  },
  {
    slug: "carelink",
    title: "CareLink",
    blurb: "Ambient interfaces for assisted living and elderly care.",
    status: "Completed",
    funding: ["Industry Partner Fund"],
    period: "2022 to 2024",
    overview:
      "CareLink explored calm, ambient interfaces that support assisted living without demanding constant attention from residents or caregivers. The project delivered interaction techniques validated with placeholder user studies.",
    objectives: [
      "Design low-effort interfaces for assisted living",
      "Keep caregivers informed without alarm fatigue",
      "Evaluate techniques with representative users",
    ],
    outcomes: ["Full paper at ACM CHI 2025", "Design guidelines for ambient care interfaces"],
    team: ["Dr. Ananya Verma", "Sneha Nair"],
  },
];
