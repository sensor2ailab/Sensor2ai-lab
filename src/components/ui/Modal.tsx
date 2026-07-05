"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { durBase, easeOut } from "@/lib/motion";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Accessible, animated dialog: backdrop fade + panel rise, Escape to close, scroll
// lock while open. Rendered through a portal so it escapes any transformed parent.
export function Modal({ open, title, onClose, children }: ModalProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  // The backdrop animates its blur radius (not just opacity) so the frost eases in
  // smoothly instead of popping at full strength.
  const backdrop = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, backdropFilter: "blur(0px)" },
        animate: { opacity: 1, backdropFilter: "blur(6px)" },
        exit: { opacity: 0, backdropFilter: "blur(0px)" },
      };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : durBase, ease: easeOut }}
        >
          <m.button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="bg-ink/50 absolute inset-0"
            {...backdrop}
            transition={{ duration: reduce ? 0 : 0.45, ease: easeOut }}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="border-border bg-background shadow-lift relative z-10 my-auto w-full max-w-lg rounded-lg border p-6 sm:p-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: easeOut }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="text-h3 font-semibold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-muted hover:text-foreground hover:bg-surface-2 -mr-1 rounded-md p-1 transition-colors duration-[var(--dur-fast)]"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {children}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
