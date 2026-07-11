import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { RevealHeading } from "@/components/ui/RevealHeading";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

// Consistent intro band for inner pages. Title is centered and scaled to match
// the staggered menu items.
export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <section className="border-border bg-surface flex flex-col items-center justify-center border-b text-center">
      <Container className="flex flex-col gap-4 py-14 sm:py-16">
        <RevealHeading
          text={title}
          className="text-center text-[clamp(2rem,9vw,4.75rem)] text-balance wrap-break-word"
        />
        {subtitle ? (
          <p
            data-reveal
            suppressHydrationWarning
            style={{ "--reveal-delay": "0.12s" } as CSSProperties}
            className="text-lead text-secondary mx-auto max-w-2xl text-center"
          >
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="pt-2">{children}</div> : null}
      </Container>
    </section>
  );
}
