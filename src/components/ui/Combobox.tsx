"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Loader2, Plus, Search } from "lucide-react";
import { durBase, easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Static options. Used on their own, or as the initial list for an async source. */
  options?: string[];
  /**
   * Async source. When supplied, the query is debounced and results replace the list
   * (the server does the filtering). Must be referentially stable therefore, define it outside
   * the component or memoise it.
   */
  fetchOptions?: (query: string) => Promise<string[]>;
  placeholder?: string;
  id?: string;
  className?: string;
}

const LIMIT = 60;

// Searchable select that also accepts a free-text ("Other") value: type a name that is
// not in the list and confirm it with the "Use …" row. Works against a static list or
// a debounced async source. Tokened, animated, dismissible by outside-click or Escape.
export function Combobox({
  value,
  onChange,
  options = [],
  fetchOptions,
  placeholder = "Select…",
  id,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<string[] | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const listId = `${id ?? "combobox"}-listbox`;

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onDown(e: globalThis.MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const q = query.trim();

  // Debounced async lookup while the panel is open.
  useEffect(() => {
    if (!fetchOptions || !open) return;
    let live = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoadingOptions(true);
        try {
          const results = await fetchOptions(q);
          if (live) setRemote(results);
        } catch {
          // keep whatever is on screen; the "Other" write-in always works
        } finally {
          if (live) setLoadingOptions(false);
        }
      })();
    }, 250);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [q, open, fetchOptions]);

  const filtered = useMemo(() => {
    // Async source: the server already filtered; fall back to the static list until
    // the first response lands.
    if (fetchOptions) return (remote ?? options).slice(0, LIMIT);
    if (!q) return options.slice(0, LIMIT);
    const lower = q.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(lower)).slice(0, LIMIT);
  }, [q, options, fetchOptions, remote]);

  const exactMatch = filtered.some((o) => o.toLowerCase() === q.toLowerCase());

  function pick(v: string) {
    onChange(v);
    setQuery("");
    setActive(0);
    setOpen(false);
  }

  // Roving highlight over the filtered list; Enter takes the highlighted option, or
  // the typed value when nothing matches ("Other").
  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length === 0) return;
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next = (active + dir + filtered.length) % filtered.length;
      setActive(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const choice = filtered[active] ?? filtered[0];
      if (choice) pick(choice);
      else if (q) pick(q);
    }
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border-border bg-background hover:border-primary focus:border-primary focus:ring-primary/25 flex w-full items-center justify-between gap-2 rounded-md border px-3.5 py-2.5 text-sm transition-[border-color,box-shadow] duration-(--dur-fast) focus:ring-2 focus:outline-none"
      >
        <span className={cn("truncate text-left", value ? "text-foreground" : "text-muted")}>
          {value || placeholder}
        </span>
        <ChevronDown className="text-muted size-4 shrink-0" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: reduce ? 0 : durBase, ease: easeOut }}
            className="border-border bg-background shadow-lift absolute top-full left-0 z-40 mt-2 w-full origin-top rounded-lg border p-2"
          >
            <div className="relative mb-2">
              <Search
                className="text-muted pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                role="combobox"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onSearchKeyDown}
                placeholder="Search or type your college"
                aria-label="Search college"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={filtered[active] ? `${listId}-opt-${active}` : undefined}
                className="border-border bg-background focus:border-primary focus:ring-primary/25 w-full rounded-md border py-2 pr-3 pl-8 text-sm focus:ring-2 focus:outline-none"
              />
            </div>

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Colleges"
              className="thin-scroll max-h-56 overflow-y-auto"
            >
              {filtered.map((o, i) => (
                <li key={o} id={`${listId}-opt-${i}`} role="option" aria-selected={value === o}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => pick(o)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-(--dur-fast)",
                      i === active ? "bg-surface-2" : "hover:bg-surface-2",
                    )}
                  >
                    <span className="text-foreground">{o}</span>
                    {value === o ? (
                      <Check className="text-primary size-4 shrink-0" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              ))}
              {filtered.length === 0 ? (
                <li className="text-muted flex items-center gap-2 px-2.5 py-2 text-sm">
                  {loadingOptions ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      Searching…
                    </>
                  ) : q ? (
                    "No match therefore, use the option below to add it."
                  ) : (
                    "Type to search…"
                  )}
                </li>
              ) : null}
            </ul>

            {loadingOptions && filtered.length > 0 ? (
              <p className="text-muted flex items-center gap-1.5 px-2.5 pt-1 text-xs">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                Searching…
              </p>
            ) : null}

            {q && !exactMatch ? (
              <button
                type="button"
                onClick={() => pick(q)}
                className="border-border text-primary hover:bg-primary-soft mt-1 flex w-full items-center gap-2 rounded-md border-t px-2.5 py-2 text-left text-sm font-medium transition-colors duration-(--dur-fast)"
              >
                <Plus className="size-4 shrink-0" aria-hidden="true" />
                Use “{q}” (other)
              </button>
            ) : null}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
