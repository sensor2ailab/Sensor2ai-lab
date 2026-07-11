import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-[transform,background-color,color,border-color] duration-(--dur-fast) ease-out focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary:
    "border border-border bg-background text-foreground hover:border-primary hover:text-primary",
  ghost: "text-foreground hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm sm:text-base",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

interface LinkProps extends CommonProps {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
  disabled?: never;
  loading?: never;
}

interface NativeButtonProps extends CommonProps {
  href?: never;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  // While true the button is disabled and shows a leading spinner, so an in-flight
  // action cannot be triggered twice. Prefer this over a manual `disabled={busy}`.
  loading?: boolean;
}

type ButtonProps = LinkProps | NativeButtonProps;

// Renders a link when given href, otherwise a native button. Colors come from tokens.
export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const external = props.external;
    return (
      <Link
        href={props.href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      aria-busy={props.loading || undefined}
      className={classes}
    >
      {props.loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
