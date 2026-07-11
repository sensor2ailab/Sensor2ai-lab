import type { Metadata } from "next";
import type { ReactNode } from "react";

// Signed-in surface: give it a real title, but keep it out of search results.
export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

export default function InboxLayout({ children }: { children: ReactNode }) {
  return children;
}
