"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { durBase, easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

// Accessible tabs: roving arrow-key focus, animated underline, cross-fade panels.
export function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const baseId = useId();
  const reduce = useReducedMotion();
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const dir = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + dir + items.length) % items.length;
    const nextItem = items[next];
    if (!nextItem) return;
    setActive(nextItem.id);
    document.getElementById(`${baseId}-tab-${nextItem.id}`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Content tabs" className="border-border flex gap-2 border-b">
        {items.map((item, index) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors duration-(--dur-fast) ease-out",
                selected ? "text-primary" : "text-secondary hover:text-foreground",
              )}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={cn(
                  "bg-accent absolute inset-x-0 -bottom-px h-0.5 origin-left transition-transform duration-(--dur-base) ease-out",
                  selected ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="pt-8">
        {reduce ? (
          <div
            id={`${baseId}-panel-${activeItem?.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${activeItem?.id}`}
          >
            {activeItem?.content}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <m.div
              key={activeItem?.id}
              id={`${baseId}-panel-${activeItem?.id}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${activeItem?.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: durBase, ease: easeOut }}
            >
              {activeItem?.content}
            </m.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
