"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Award, X } from "lucide-react";
import { durBase, easeOut } from "@/lib/motion";
import { useScrollLock } from "@/lib/scroll-lock";

// A "View certificate" action for past interns plus the pop-up image viewer it opens.
// The lightbox mirrors the shared Modal's conventions therefore portal, backdrop frost,
// Escape to close, scroll lock therefore but is sized for a full certificate image.
export function CertificateViewer({ src, name }: { src: string; name: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const title = `${name} · Internship certificate`;

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const backdrop = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, backdropFilter: "blur(0px)" },
        animate: { opacity: 1, backdropFilter: "blur(6px)" },
        exit: { opacity: 0, backdropFilter: "blur(0px)" },
      };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-secondary hover:border-primary hover:text-primary border-border mt-4 inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-sm font-medium transition-[color,border-color] duration-(--dur-fast) ease-out"
      >
        <Award className="size-4" aria-hidden="true" />
        View certificate
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <m.div
                  className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : durBase, ease: easeOut }}
                >
                  <m.button
                    type="button"
                    aria-label="Close certificate viewer"
                    onClick={() => setOpen(false)}
                    className="bg-ink/50 absolute inset-0"
                    {...backdrop}
                    transition={{ duration: reduce ? 0 : 0.45, ease: easeOut }}
                  />
                  <m.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    className="border-border bg-background shadow-lift relative z-10 my-auto w-full max-w-3xl rounded-lg border p-4 sm:p-6"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: easeOut }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <h2 className="text-h3 font-semibold">{title}</h2>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close"
                        className="text-muted hover:text-foreground hover:bg-surface-2 -mr-1 rounded-md p-1 transition-colors duration-(--dur-fast)"
                      >
                        <X className="size-5" aria-hidden="true" />
                      </button>
                    </div>
                    {/* Plain img: certificates are documents supplied as-is, kept out of
                        the next/image optimisation pipeline (and its SVG restriction). */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Internship certificate awarded to ${name}`}
                      className="border-border bg-surface mx-auto h-auto w-full rounded-md border object-contain"
                    />
                  </m.div>
                </m.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
