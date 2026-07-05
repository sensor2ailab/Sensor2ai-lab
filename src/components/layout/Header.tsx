import { SiteMenu } from "@/components/layout/SiteMenu";

// Minimal header: only the staggered-menu toggle, pinned to the top-right. The
// wrapper is a zero-height sticky bar with a higher z-index, so it stays put on
// scroll while page content fills the space behind it. The session control lives
// inside the menu panel.
export function Header() {
  return (
    <div className="pointer-events-none sticky top-0 z-50 flex h-0 justify-end">
      <div className="pointer-events-auto p-4 sm:p-6 lg:p-8">
        <SiteMenu />
      </div>
    </div>
  );
}
