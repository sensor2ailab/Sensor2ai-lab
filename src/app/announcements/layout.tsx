import type { Metadata } from "next";
import type { ReactNode } from "react";

// Announcements are for signed-in members only, so keep the route out of search
// results (the page itself still requires auth to load any content).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AnnouncementsLayout({ children }: { children: ReactNode }) {
  return children;
}
