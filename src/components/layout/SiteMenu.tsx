"use client";

import { gsap } from "gsap";
import { m } from "motion/react";
import { createPortal } from "react-dom";
import { LogIn, LogOut, ShieldCheck, User } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { useAuth } from "@/components/auth/AuthProvider";

// Ported from React Bits (Staggered Menu), rebuilt for this site: colors come from
// tokens (no raw hex), it lives inside the existing header instead of drawing its
// own, and it adds the accessibility the source omits: Escape to close, a focus
// trap, scroll lock, inert-when-closed links, and reduced-motion fallbacks.

// Prelayers sweep in behind the panel: ink first, then the orange accent, then the
// white panel settles on top for a brief brand flash during the reveal.
const PRELAYER_COLORS = ["var(--color-ink)", "var(--color-primary)"];

const socials = [
  { label: "Scholar", href: site.social.scholar },
  { label: "LinkedIn", href: site.social.linkedin },
  { label: "GitHub", href: site.social.github },
];

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stable no-op subscription: the value never changes after hydration, we only
// need a server/client split to decide when the body portal may render.
const noopSubscribe = () => () => {};

// Slide timing for the Menu / Close label swap on the toggle.
const ICON_TWEEN = { duration: 0.4, ease: "easeInOut" } as const;

export function SiteMenu() {
  const { status, user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  // False on the server and first hydration pass, true once on the client, so the
  // portal below stays out of the header's backdrop-filter containing block.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const initedRef = useRef(false);

  // Seed the offscreen state once so the first open animates in from the right.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const layers = preLayersRef.current
      ? (Array.from(preLayersRef.current.querySelectorAll(".sm-prelayer")) as HTMLElement[])
      : [];
    const ctx = gsap.context(() => {
      gsap.set([panel, ...layers], { xPercent: 100 });
    });
    return () => ctx.revert();
  }, [isClient]);

  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const rm = prefersReduced();
    const d = (value: number) => (rm ? 0 : value);

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const layers = preLayersRef.current
      ? (Array.from(preLayersRef.current.querySelectorAll(".sm-prelayer")) as HTMLElement[])
      : [];
    const items = Array.from(panel.querySelectorAll(".sm-itemLabel")) as HTMLElement[];
    const numbers = Array.from(
      panel.querySelectorAll("[data-numbering] .sm-item"),
    ) as HTMLElement[];
    const socialLinks = Array.from(panel.querySelectorAll(".sm-social")) as HTMLElement[];

    gsap.set(items, { yPercent: 140, rotate: 8 });
    gsap.set(numbers, { "--sm-num-opacity": 0 });
    gsap.set(socialLinks, { y: 24, opacity: 0 });

    const tl = gsap.timeline();
    layers.forEach((layer, i) => {
      tl.fromTo(
        layer,
        { xPercent: 100 },
        { xPercent: 0, duration: d(0.5), ease: "power4.out" },
        i * d(0.07),
      );
    });

    const panelStart = layers.length ? layers.length * d(0.07) + d(0.08) : 0;
    tl.fromTo(
      panel,
      { xPercent: 100 },
      { xPercent: 0, duration: d(0.6), ease: "power4.out" },
      panelStart,
    );

    const itemsStart = panelStart + d(0.1);
    tl.to(
      items,
      { yPercent: 0, rotate: 0, duration: d(0.9), ease: "power4.out", stagger: d(0.09) },
      itemsStart,
    );
    tl.to(
      numbers,
      { "--sm-num-opacity": 1, duration: d(0.6), ease: "power2.out", stagger: d(0.08) },
      itemsStart + d(0.1),
    );
    tl.to(
      socialLinks,
      { y: 0, opacity: 1, duration: d(0.5), ease: "power3.out", stagger: d(0.07) },
      itemsStart + d(0.2),
    );

    openTlRef.current = tl;
  }, []);

  const playClose = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const rm = prefersReduced();
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const layers = preLayersRef.current
      ? (Array.from(preLayersRef.current.querySelectorAll(".sm-prelayer")) as HTMLElement[])
      : [];

    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: 100,
      duration: rm ? 0 : 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => setVisible(false),
    });
  }, []);

  const openMenu = useCallback(() => {
    setVisible(true);
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => setOpen(false), []);

  // Run the matching timeline whenever open flips. The toggle icon and label are
  // animated declaratively by motion below, off the same open state.
  useLayoutEffect(() => {
    if (open) {
      playOpen();
    } else if (initedRef.current) {
      playClose();
    }
    initedRef.current = true;
  }, [open, playOpen, playClose]);

  // Focus trap, Escape, scroll lock, and focus return while open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    focusables?.[0]?.focus();
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      toggle?.focus();
    };
  }, [open, closeMenu]);

  const overlay = (
    <div className="sm-scope fixed inset-0 z-30" hidden={!visible} inert={!open || undefined}>
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={closeMenu}
        className="bg-ink/30 absolute inset-0 backdrop-blur-[1px]"
      />

      <div
        ref={preLayersRef}
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[min(34rem,100%)]"
      >
        {PRELAYER_COLORS.map((color, i) => (
          <div
            key={i}
            className="sm-prelayer absolute inset-0 will-change-transform"
            style={{ background: color }}
          />
        ))}
      </div>

      <aside
        id="site-menu-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="bg-background absolute inset-y-0 right-0 flex w-[min(34rem,100%)] flex-col gap-6 overflow-y-auto p-8 pt-28 will-change-transform"
      >
        <nav aria-label="Primary">
          <ul data-numbering className="flex flex-col gap-1">
            {navItems
              .filter((item) => !item.authOnly || status === "authed")
              .map((item) => (
                <li key={item.href} className="relative overflow-hidden leading-none">
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    className="sm-item text-foreground hover:text-primary relative inline-block pr-12 text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold tracking-tight uppercase transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
                  >
                    <span className="sm-itemLabel inline-block will-change-transform">
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-6 pt-6">
          <div className="border-border flex flex-col gap-3 border-t pt-6">
            <h2 className="text-primary text-sm font-semibold tracking-wide uppercase">Account</h2>
            {status === "loading" ? null : !user ? (
              <a
                href="/login"
                onClick={closeMenu}
                className="text-foreground hover:text-primary inline-flex w-fit items-center gap-2 text-lg font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
              >
                <LogIn className="size-5" aria-hidden="true" />
                Sign in
              </a>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-foreground inline-flex items-center gap-2 text-base font-semibold">
                  {user.fullName}
                </span>
                {isAdmin ? (
                  <span className="bg-primary-soft text-primary-hover rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                    Admin
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="text-secondary hover:text-primary inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <div className="sm-socials flex flex-col gap-3">
            <h2 className="text-primary text-sm font-semibold tracking-wide uppercase">Connect</h2>
            <ul className="flex flex-wrap items-center gap-4">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm-social text-secondary hover:text-primary text-base font-medium transition-[color,opacity] duration-[var(--dur-fast)] ease-[var(--ease-out)]"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-menu-panel"
        className="bg-primary text-on-primary hover:bg-primary-hover shadow-card relative z-50 inline-flex items-center justify-center rounded-full px-4 py-4 text-lg font-semibold tracking-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
      >
        <span
          className="relative inline-block h-[1em] w-[3.6em] overflow-hidden text-center"
          aria-hidden="true"
        >
          <m.span
            animate={{ y: open ? "-50%" : "0%" }}
            transition={ICON_TWEEN}
            className="flex flex-col items-center leading-none"
          >
            <span className="block leading-none md:h-[1em]">Menu</span>
            <span className="block leading-none md:h-[1em]">Close</span>
          </m.span>
        </span>
      </button>

      {isClient ? createPortal(overlay, document.body) : null}

      <style>{`
        .sm-scope [data-numbering] { counter-reset: smItem; }
        .sm-scope [data-numbering] .sm-item::after {
          counter-increment: smItem;
          content: counter(smItem, decimal-leading-zero);
          position: absolute;
          top: 0.35em;
          right: 0;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-primary);
          opacity: var(--sm-num-opacity, 0);
          pointer-events: none;
        }
        .sm-scope .sm-socials:hover .sm-social:not(:hover),
        .sm-scope .sm-socials:focus-within .sm-social:not(:focus-visible) { opacity: 0.4; }
      `}</style>
    </>
  );
}
