import type { LucideIcon } from "lucide-react";

// Shared content types. All page data is modelled here so data files stay typed
// and swapping placeholder content for real content is a data-only change.

export interface NavItem {
  label: string;
  href: string;
  // Shown in the menu only to signed-in users.
  authOnly?: boolean;
  // Shown in the menu only to admins.
  adminOnly?: boolean;
}

export type LinkType = "profile" | "website" | "scholar" | "linkedin" | "email" | "github";

export interface PersonLink {
  type: LinkType;
  href: string;
}

export interface Person {
  name: string;
  role: string;
  focus?: string;
  image?: string;
  links?: PersonLink[];
  featured?: boolean;
  // Path (under /public) to an internship certificate. Past interns only; when set,
  // the card shows a "View certificate" action that opens a pop-up image viewer.
  certificate?: string;
}

export interface TeamGroup {
  id: string;
  title: string;
  members: Person[];
}

export interface TeamData {
  current: TeamGroup[];
  interns: TeamGroup[];
  alumni: TeamGroup[];
}

export type ProjectStatus = "Ongoing Research" | "Ongoing/Approved" | "Completed";

export interface Project {
  slug: string;
  title: string;
  blurb: string;
  status: ProjectStatus;
  funding: string[];
  period?: string;
  overview: string;
  objectives: string[];
  outcomes: string[];
  team: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  venue: string;
  date: string;
  year: number;
  people?: string[];
  href?: string;
  highlighted?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  detail: string;
  venue?: string;
  icon: LucideIcon;
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  href: string;
  icon: LucideIcon;
  note: string;
}

export interface Collaborator {
  name: string;
  location: string;
  href: string;
}

export interface Sponsor {
  name: string;
  href: string;
  // Path to a logo asset under /public. Placeholder marks for now; swap later.
  logo: string;
}
