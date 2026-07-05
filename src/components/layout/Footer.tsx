import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { GitHubIcon, LinkedInIcon, ScholarIcon } from "@/components/brand/SocialIcons";

const year = new Date().getFullYear();

const socials = [
  { label: "Google Scholar", href: site.social.scholar, icon: ScholarIcon },
  { label: "LinkedIn", href: site.social.linkedin, icon: LinkedInIcon },
  { label: "GitHub", href: site.social.github, icon: GitHubIcon },
];

// Grid lines come from each cell's right/bottom border plus the top/left on the grid.
const CELL = "border-on-ink/10 flex min-h-36 flex-col gap-3 border-r border-b p-6 sm:p-8";
const LABEL = "text-on-ink/50 text-xs font-semibold tracking-[0.2em] uppercase";
const LINK =
  "text-on-ink/70 hover:text-accent transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]";

// Dark footer. A full-bleed bento grid (brand, contact, connect, location, sitemap)
// fills the top so it never reads as empty, then an oversized wordmark and the
// copyright line. Uses the ink tokens throughout.
export function Footer() {
  return (
    <footer className="bg-ink text-on-ink overflow-hidden">
      <div className="border-on-ink/10 grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + tagline */}
        <div className={`${CELL} justify-center gap-2 sm:col-span-2`}>
          <span className="font-display text-on-ink text-2xl font-extrabold tracking-tight">
            {site.name}
          </span>
          <p className="text-on-ink/55 text-sm">{site.tagline}</p>
        </div>

        {/* Contact */}
        <div className={CELL}>
          <h2 className={LABEL}>Contact us</h2>
          <a
            href={`mailto:${site.email}`}
            className={`${LINK} inline-flex w-fit items-center gap-2`}
          >
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            {site.email}
          </a>
        </div>

        {/* Connect */}
        <div className={CELL}>
          <h2 className={LABEL}>Connect</h2>
          <div className="mt-1 flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-pill border-on-ink/20 text-on-ink/70 hover:border-accent hover:text-accent inline-flex size-10 items-center justify-center border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
              >
                <Icon className="size-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className={`${CELL} sm:col-span-2`}>
          <h2 className={LABEL}>Location</h2>
          <p className="text-on-ink/75 inline-flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {site.department}
              <br />
              {site.institute}, {site.location}
            </span>
          </p>
        </div>

        {/* Sitemap */}
        <nav aria-label="Footer" className={`${CELL} sm:col-span-2`}>
          <h2 className={LABEL}>Sitemap</h2>
          <div className="mt-1 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={LINK}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Oversized full-bleed wordmark. SVG text stretches to fill the width exactly
          and the viewBox drives the auto height. Decorative: name is stated above. */}
      <div className="border-on-ink/10 text-on-ink border-b py-2">
        <svg
          viewBox="0 0 1000 132"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="block h-auto w-full"
        >
          <text
            x="500"
            y="66"
            textLength="984"
            lengthAdjust="spacingAndGlyphs"
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            className="font-display"
            style={{ fontWeight: 800, fontSize: "128px", letterSpacing: "-0.03em" }}
          >
            {site.name.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Copyright */}
      <Container className="py-8">
        <div className="text-on-ink/50 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {site.name}, {site.instituteShort}.
          </p>
          <p>All rights reserved.</p>
        </div>
      </Container>

      {/* Built-by credit, set in the same bordered-band style as the grid above. */}
      <div className="border-on-ink/10 border-t">
        <Container className="flex flex-col items-center gap-2.5 py-9 text-center">
          <span className={LABEL}>Developed and maintained by</span>
          <Link
            href="https://github.com/abhishekkumawat-47"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abhishek Kumawat on GitHub"
            className="group inline-flex items-center gap-2.5"
          >
            <span className="font-signature from-primary via-accent to-primary hover:text-primary bg-gradient-to-r bg-clip-text px-2 pb-1 text-4xl leading-tight text-transparent transition-[filter] duration-[var(--dur-base)] ease-[var(--ease-out)] sm:text-5xl">
              Abhishek Kumawat
            </span>
          </Link>
        </Container>
      </div>
    </footer>
  );
}
