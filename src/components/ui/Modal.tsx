"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { durBase, easeOut } from "@/lib/motion";
import { useScrollLock } from "@/lib/scroll-lock";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible, animated dialog: backdrop fade + panel rise, Escape to close, scroll
// lock, focus moved into the panel and trapped while open, and focus returned to the
// trigger on close. Rendered through a portal so it escapes any transformed parent.
export function Modal({ open, title, onClose, children }: ModalProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    // Move focus into the dialog (first control, else the panel itself).
    (focusables()[0] ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
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
          className="thin-scroll fixed inset-0 z-100 overflow-y-auto overscroll-contain"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : durBase, ease: easeOut }}
        >
          <m.button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="bg-ink/50 fixed inset-0"
            {...backdrop}
            transition={{ duration: reduce ? 0 : 0.45, ease: easeOut }}
          />
          {/* min-h-full flex wrapper keeps the panel centered while still letting tall
              content scroll all the way to the top (a plain items-center overflow clips it). */}
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              layout={reduce ? false : true}
              className="border-border bg-background shadow-lift relative z-10 my-4 w-full max-w-lg rounded-lg border p-6 outline-none sm:p-8"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{
                duration: reduce ? 0 : 0.4,
                ease: easeOut,
                layout: { duration: reduce ? 0 : 0.32, ease: easeOut },
              }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <h2 className="text-h3 font-semibold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="text-muted hover:text-foreground hover:bg-surface-2 -mr-1 rounded-md p-1 transition-colors duration-(--dur-fast)"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              {/* Keyed so swapping content (e.g. spinner -> email draft) cross-fades while
                  the panel's `layout` animates its height smoothly instead of jumping. */}
              <m.div layout={reduce ? false : "position"}>{children}</m.div>
            </m.div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
