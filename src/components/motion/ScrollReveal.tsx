"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// A single app-wide IntersectionObserver that drives every `[data-reveal]` element
// (the CSS lives in globals.css). One observer for the whole page — not one per
// element — keeps this cheap no matter how many things reveal.
//
// `is-in` is toggled on both enter AND leave, so elements ease in on the way down and
// replay on the way back up. A MutationObserver picks up nodes added after fetches
// (lists, modals), and we re-scan on route changes.
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Respect reduced motion: leave everything in its final visible state (the CSS is
    // gated the same way) and do no work.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-in", entry.isIntersecting);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    const seen = new WeakSet<Element>();
    const observe = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      io.observe(el);
    };
    const scan = (root: ParentNode) => root.querySelectorAll("[data-reveal]").forEach(observe);

    scan(document);

    // Observe elements mounted later (data-driven lists, dialogs, route content).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          const el = node as Element;
          if (el.matches("[data-reveal]")) observe(el);
          scan(el);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
