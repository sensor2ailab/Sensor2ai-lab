import type { NavItem } from "@/types";

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Team", href: "/team" },
  { label: "Publications", href: "/publications" },
  { label: "Projects", href: "/projects" },
  { label: "News", href: "/news" },
  { label: "Announcements", href: "/announcements", authOnly: true },
  { label: "Inbox", href: "/inbox", authOnly: true },
  { label: "Hired", href: "/admin/hired", adminOnly: true },
  { label: "Join Us", href: "/join" },
];
