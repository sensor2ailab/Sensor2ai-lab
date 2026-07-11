import type { CSSProperties } from "react";
import { Fragment } from "react";

// A heading whose words reveal one after another on scroll (split-text effect), driven
// by the shared ScrollReveal observer via the `[data-reveal]` CSS. Server component, so
// it ships no JS. Use for page and section titles; `stagger` tunes the per-word delay.
export function RevealHeading({
  text,
  as: Tag = "h1",
  className,
  stagger = 0.05,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  stagger?: number;
}) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span
            data-reveal
            suppressHydrationWarning
            className="reveal-word"
            style={{ "--reveal-delay": `${(i * stagger).toFixed(3)}s` } as CSSProperties}
          >
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </Tag>
  );
}
