import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, User } from "lucide-react";
import type { ComponentType } from "react";
import type { LinkType, Person } from "@/types";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/cn";
import { GitHubIcon, LinkedInIcon, ScholarIcon } from "@/components/brand/SocialIcons";
import { CertificateViewer } from "@/components/team/CertificateViewer";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

const linkMeta: Record<LinkType, { label: string; icon: IconComponent }> = {
  profile: { label: "Profile", icon: User },
  website: { label: "Website", icon: Globe },
  scholar: { label: "Google Scholar", icon: ScholarIcon },
  linkedin: { label: "LinkedIn", icon: LinkedInIcon },
  email: { label: "Email", icon: Mail },
  github: { label: "GitHub", icon: GitHubIcon },
};

// Profile card adapted from a React Bits style hover: on hover or keyboard focus
// the photo shrinks into a surface-coloured ring that reveals the orange frame,
// and a social bar slides up from the bottom. Transform and opacity only, themed
// entirely from tokens, and reduced-motion is handled by the global CSS reset.
export function PersonCard({ person }: { person: Person }) {
  const featured = Boolean(person.featured);
  const size = featured ? 160 : 128;

  return (
    <article className="group border-border bg-surface relative flex h-full flex-col items-center overflow-hidden rounded-lg border px-6 pt-9 pb-16 text-center">
      <div className={cn("relative mb-6", featured ? "size-40" : "size-32")}>
        {/* Orange frame revealed as the photo shrinks. */}
        <span aria-hidden="true" className="bg-accent absolute inset-0 rounded-full" />
        <div className="absolute inset-0 overflow-hidden rounded-full transition-[transform,box-shadow] duration-(--dur-slow) ease-out group-focus-within:scale-[0.72] group-focus-within:[box-shadow:0_0_0_14px_var(--color-surface)] group-hover:scale-[0.72] group-hover:[box-shadow:0_0_0_14px_var(--color-surface)]">
          {person.image ? (
            <Image
              src={person.image}
              alt={person.name}
              width={size}
              height={size}
              className="size-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="bg-surface-2 text-foreground font-display flex size-full items-center justify-center text-2xl font-semibold"
            >
              {initials(person.name)}
            </span>
          )}
        </div>
      </div>

      <h3 className={cn("font-semibold", featured ? "text-2xl" : "text-lg")}>{person.name}</h3>
      <p className="text-primary mt-1 text-sm font-medium">{person.role}</p>
      {person.focus ? <p className="text-secondary mt-2 text-sm">{person.focus}</p> : null}

      {person.certificate ? (
        <CertificateViewer src={person.certificate} name={person.name} />
      ) : null}

      {person.links?.length ? (
        <ul className="bg-accent absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center transition-transform duration-(--dur-base) ease-out group-focus-within:translate-y-0 group-hover:translate-y-0">
          {person.links.map((link) => {
            const meta = linkMeta[link.type];
            const Icon = meta.icon;
            const external = link.href.startsWith("http");
            return (
              <li key={link.type}>
                <Link
                  href={link.href}
                  aria-label={`${meta.label} of ${person.name}`}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="text-on-primary hover:bg-surface hover:text-primary flex size-11 items-center justify-center transition-colors duration-(--dur-fast) ease-out"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </article>
  );
}
