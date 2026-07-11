"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { durBase, easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const isoOf = (d: Date) => toISO(d.getFullYear(), d.getMonth(), d.getDate());

interface Props {
  value: string | null; // yyyy-mm-dd
  onChange: (value: string | null) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

// A self-contained calendar field: a formal, tokened month grid with keyboard
// dismissal and Today/Clear shortcuts. Replaces the browser's native date input.
export function DatePicker({ value, onChange, placeholder = "Select date", id, className }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const [view, setView] = useState(() => {
    const base = value ? new Date(`${value}T00:00:00`) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  useEffect(() => {
    if (!open) return;
    function onDown(e: globalThis.MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const days = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const start = new Date(view.year, view.month, 1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view]);

  const todayISO = isoOf(new Date());
  const label = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  function shiftMonth(delta: number) {
    setView((v) => {
      const total = v.year * 12 + v.month + delta;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
  }

  return (
    <span ref={wrapRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="border-border bg-background hover:border-primary focus:border-primary focus:ring-primary/25 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-(--dur-fast) focus:ring-2 focus:outline-none"
      >
        <CalendarIcon className="text-muted size-4 shrink-0" aria-hidden="true" />
        <span className={value ? "text-foreground" : "text-muted"}>{value ? label : placeholder}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            role="dialog"
            aria-label="Choose date"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: reduce ? 0 : durBase, ease: easeOut }}
            className="border-border bg-background shadow-lift absolute top-full left-0 z-40 mt-2 w-72 origin-top-left rounded-lg border p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-foreground text-sm font-semibold">
                {MONTHS[view.month]} {view.year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  className="text-muted hover:text-foreground hover:bg-surface-2 rounded-md p-1 transition-colors duration-(--dur-fast)"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="text-muted hover:text-foreground hover:bg-surface-2 rounded-md p-1 transition-colors duration-(--dur-fast)"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-muted py-1 text-center text-[11px] font-medium">
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {days.map((d) => {
                const iso = isoOf(d);
                const inMonth = d.getMonth() === view.month;
                const isSelected = value === iso;
                const isToday = iso === todayISO;
                const dayLabel = d.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-label={dayLabel}
                    aria-pressed={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex h-8 items-center justify-center rounded-md text-sm transition-colors duration-(--dur-fast)",
                      isSelected
                        ? "bg-primary text-on-primary font-semibold"
                        : inMonth
                          ? "text-foreground hover:bg-primary-soft"
                          : "text-muted hover:bg-surface-2",
                      !isSelected && isToday ? "ring-accent ring-1 ring-inset" : "",
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="border-border mt-2 flex items-center justify-between border-t pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="text-muted hover:text-danger text-xs font-medium transition-colors duration-(--dur-fast)"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(todayISO);
                  setOpen(false);
                }}
                className="text-primary hover:text-primary-hover text-xs font-medium transition-colors duration-(--dur-fast)"
              >
                Today
              </button>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
