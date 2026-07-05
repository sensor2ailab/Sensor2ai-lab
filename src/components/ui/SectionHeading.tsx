import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h2" | "h1";
  className?: string;
}

// Eyebrow + title + optional subtitle, used to open most sections.
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
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
        {title}
      </Tag>
      {subtitle ? (
        <p className={cn("text-lead text-secondary max-w-2xl", align === "center" && "mx-auto")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
