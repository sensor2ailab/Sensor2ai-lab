import type { Metadata } from "next";
import type { ReactNode } from "react";

// Every admin surface: titled for the tab, and never indexed.
export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
