"use client";

import Link from "next/link";
import { navItems } from "@/data/nav";
import { useAuth } from "@/components/auth/AuthProvider";

// The footer sitemap, filtered by role exactly like the site menu: auth-only links
// (Announcements, Inbox) show once signed in, admin-only links (Hired) only to admins.
export function FooterSitemap({
  cellClass,
  labelClass,
  linkClass,
}: {
  cellClass: string;
  labelClass: string;
  linkClass: string;
}) {
  const { status, isAdmin } = useAuth();
  const items = navItems.filter(
    (item) => (!item.authOnly || status === "authed") && (!item.adminOnly || isAdmin),
  );

  return (
    <nav aria-label="Footer" className={`${cellClass} sm:col-span-2`}>
      <h2 className={labelClass}>Sitemap</h2>
      <div className="mt-1 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
