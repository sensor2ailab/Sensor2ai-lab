import type { TeamData } from "@/types";

// Placeholder team roster. Names, roles, and focus areas are stand-ins that read
// as a credible academic lab; swap for real members later. No images yet, so cards
// fall back to monogram avatars. Past interns carry a `certificate` path (placeholder
// SVGs under /public) that the card opens in a pop-up viewer.

export const team: TeamData = {
  current: [
    {
      id: "faculty",
      title: "Faculty",
      members: [
        {
          name: "Dr. Ananya Verma",
          role: "Principal Investigator, Assistant Professor",
          focus: "Ubiquitous sensing, AIoT, and human-centered systems",
          featured: true,
          links: [
            { type: "scholar", href: "https://scholar.google.com/" },
            { type: "website", href: "#" },
            { type: "linkedin", href: "https://www.linkedin.com/" },
          ],
        },
      ],
    },
    {
      id: "postdocs",
      title: "Postdoctoral Researchers",
      members: [
        {
          name: "Dr. Rohan Iyer",
          role: "Postdoctoral Researcher",
          focus: "Edge machine learning for wearable sensing",
          links: [{ type: "scholar", href: "https://scholar.google.com/" }],
        },
      ],
    },
    {
      id: "Research-associates",
      title: "Research Associates",
      members: [
        {
          name: "Sneha Nair",
          role: "Research Associate",
          focus: "Signal processing for ambient health monitoring",
          links: [{ type: "linkedin", href: "https://www.linkedin.com/" }],
        },
      ],
    },
    {
      id: "phd",
      title: "PhD Scholars",
      members: [
        {
          name: "Arjun Mehta",
          role: "PhD Scholar",
          focus: "On-device inference for battery-free sensors",
          links: [{ type: "scholar", href: "https://scholar.google.com/" }],
        },
        {
          name: "Priya Deshmukh",
          role: "PhD Scholar",
          focus: "Human activity recognition from inertial data",
          links: [{ type: "linkedin", href: "https://www.linkedin.com/" }],
        },
        {
          name: "Kabir Rao",
          role: "PhD Scholar",
          focus: "Indoor localization and wireless sensing",
        },
      ],
    },
    {
      id: "Research-staff",
      title: "Research Staff",
      members: [
        {
          name: "Meera Joshi",
          role: "Junior Research Fellow",
          focus: "Testbed engineering and data collection",
        },
      ],
    },
    {
      id: "mtech",
      title: "MTech Scholars",
      members: [
        {
          name: "Aditya Sharma",
          role: "MTech Scholar",
          focus: "Edge vision for autonomous mobility",
        },
        { name: "Nisha Gupta", role: "MTech Scholar", focus: "Federated learning on the edge" },
      ],
    },
    {
      id: "ugrv",
      title: "Undergraduate Research Volunteers",
      members: [
        { name: "Riya Kapoor", role: "Volunteer, Smart Health project" },
        { name: "Dev Malhotra", role: "Volunteer, SensePod project" },
      ],
    },
  ],
  interns: [
    {
      id: "present-interns",
      title: "Present Interns",
      members: [
        {
          name: "Ishan Patel",
          role: "Research Intern",
          focus: "Low-power firmware for sensor nodes",
          links: [{ type: "linkedin", href: "https://www.linkedin.com/" }],
        },
        {
          name: "Ananya Roy",
          role: "Research Intern",
          focus: "Data pipelines for activity datasets",
        },
      ],
    },
    {
      id: "past-interns",
      title: "Past Interns",
      members: [
        {
          name: "Vikram Singh",
          role: "Research Intern, 2023",
          focus: "Edge inference benchmarking",
          certificate: "/assets/img/certificates/vikram-singh.svg",
          links: [{ type: "linkedin", href: "https://www.linkedin.com/" }],
        },
        {
          name: "Meghna Rao",
          role: "Research Intern, 2022",
          focus: "Wireless sensing prototypes",
          certificate: "/assets/img/certificates/meghna-rao.svg",
        },
      ],
    },
  ],
  alumni: [
    {
      id: "alumni-mtech-2026",
      title: "MTech Alumni (2026)",
      members: [
        { name: "Sanjay Kulkarni", role: "MTech, 2026", focus: "Now Software Engineer" },
        { name: "Farah Khan", role: "MTech, 2026", focus: "Now Research Engineer" },
      ],
    },
    {
      id: "alumni-mtech-earlier",
      title: "MTech Alumni (earlier)",
      members: [{ name: "Gaurav Bansal", role: "MTech, 2024" }],
    },
    {
      id: "alumni-btech-2025",
      title: "BTech Alumni (2025)",
      members: [
        { name: "Tanvi Shah", role: "BTech, 2025" },
        { name: "Rahul Verma", role: "BTech, 2025" },
      ],
    },
    {
      id: "alumni-btech-2024",
      title: "BTech Alumni (2024)",
      members: [{ name: "Neha Agarwal", role: "BTech, 2024" }],
    },
  ],
};
