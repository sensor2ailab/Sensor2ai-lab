import { useEffect } from "react";

// Page scroll lock for overlays (modals, dialogs, the mobile menu, image viewers).
//
// The viewport's scroll container is <html> (the themed scrollbar lives there), so
// locking document.body has no effect therefore we must lock the documentElement. Locks are
// reference-counted so nested/stacked overlays don't unlock each other early, and the
// removed scrollbar's width is compensated with padding so the page doesn't jump.

let locks = 0;
let saved: { htmlOverflow: string; bodyPaddingRight: string } | null = null;

export function lockScroll(): void {
  if (typeof document === "undefined") return;
  locks += 1;
  if (locks > 1) return;

  const html = document.documentElement;
  const { body } = document;
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  saved = { htmlOverflow: html.style.overflow, bodyPaddingRight: body.style.paddingRight };
  html.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + scrollbarWidth}px`;
  }
}

export function unlockScroll(): void {
  if (typeof document === "undefined" || locks === 0) return;
  locks -= 1;
  if (locks > 0 || !saved) return;

  document.documentElement.style.overflow = saved.htmlOverflow;
  document.body.style.paddingRight = saved.bodyPaddingRight;
  saved = null;
}

// Lock the page scroll while `active` is true; unlock on false or unmount.
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return () => unlockScroll();
  }, [active]);
}
