import type { CSSProperties } from "react";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h2" | "h1";
  className?: string;
}

// Eyebrow + title + optional subtitle, used to open most sections. The title reveals
// word by word on scroll (split-text effect) and the subtitle fades in after it, all
// driven by the shared ScrollReveal observer — so it replays on scroll up and down.
export function SectionHeading({
  eyebrow: _eyebrow,
  title,
  subtitle,
  align = "center",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  const words = title.split(" ");

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {/* Sized to match the staggered menu items for a bold, display-scale title. */}
      <Tag className="max-w-3xl text-[clamp(1.75rem,6vw,3rem)] leading-none text-balance">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span
              data-reveal
              suppressHydrationWarning
              className="reveal-word"
              style={{ "--reveal-delay": `${i * 0.05}s` } as CSSProperties}
            >
              {word}
            </span>{" "}
          </Fragment>
        ))}
      </Tag>
      {subtitle ? (
        <p
          data-reveal
          suppressHydrationWarning
          style={{ "--reveal-delay": `${words.length * 0.05}s` } as CSSProperties}
          className={cn("text-lead text-secondary max-w-2xl", align === "center" && "mx-auto")}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
