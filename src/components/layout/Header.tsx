import { SiteMenu } from "@/components/layout/SiteMenu";
import { HeaderBell } from "@/components/layout/HeaderBell";

// Minimal header: a live inbox bell (signed-in only) plus the staggered-menu toggle,
// pinned to the top-right. The wrapper is a zero-height sticky bar with a higher
// z-index, so it stays put on scroll while page content fills the space behind it.
export function Header() {
  return (
    <div className="pointer-events-none sticky top-0 z-50 flex h-0 justify-end">
      <div className="pointer-events-auto flex items-center gap-3 p-4 sm:p-6 lg:p-8">
        <HeaderBell />
        <SiteMenu />
      </div>
    </div>
  );
}
