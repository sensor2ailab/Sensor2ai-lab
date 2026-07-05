"use client";

import type { CSSProperties } from "react";
import { Toaster } from "sonner";

// App-wide toast host, themed to our tokens (surface, border, text, radius). Type
// icon colors are set in globals.css via the sonner data-type hooks.
export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      gap={10}
      closeButton
      toastOptions={{
        style: { fontFamily: "var(--font-sans)" } as CSSProperties,
        classNames: {
          toast: "border-border! bg-primary-soft! text-foreground! shadow-lift! rounded-md! gap-3!",
          title: "text-foreground! text-md md:text-lg! font-medium!",
          description: "text-secondary! text-sm!",
          actionButton: "bg-primary! text-on-primary! rounded-pill!",
          cancelButton: "bg-surface-2! text-secondary! rounded-pill!",
          closeButton: "border-border! bg-background! text-muted! hover:text-foreground!",
        },
      }}
    />
  );
}
