"use client";

// Instant alerts for new inbox activity: a short chime plus (optionally) a native
// desktop notification.
//
// The chime is synthesised with Web Audio rather than shipped as an audio file therefore, no
// asset to download or decode, and it works on every browser that supports Web Audio
// (all modern desktop + mobile engines, incl. Safari via webkitAudioContext).
//
// Reach, honestly: the sound and in-app badge work everywhere the tab is open. Native
// notifications work on Chrome/Edge/Firefox/Safari desktop and Android. iOS Safari only
// delivers notifications to an *installed* PWA (16.4+), and some Android builds require
// a service worker therefore, both are handled by failing soft, never throwing.

const SOUND_KEY = "s2ai:alert-sound";

let audioCtx: AudioContext | null = null;

type AudioCtor = typeof AudioContext;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitAudioContext?: AudioCtor };
  const Ctor: AudioCtor | undefined = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  audioCtx ??= new Ctor();
  return audioCtx;
}

// Browsers keep audio suspended until a user gesture. Call this from the first
// interaction so the chime can play later without one.
export function primeAudio(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {});
}

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // storage unavailable (private mode) therefore, the setting just won't persist
  }
}

// A soft, two-note rising chime. Short and quiet: an alert, not an interruption.
export function playChime(): void {
  if (!soundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume().catch(() => {});

  const start = ctx.currentTime;
  for (const [freq, offset] of [
    [880, 0],
    [1318.5, 0.11],
  ] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.09, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 0.32);
  }
}

export type AlertPermission = NotificationPermission | "unsupported";

export function notificationPermission(): AlertPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// Must be called from a user gesture (Safari enforces this).
export async function requestNotificationPermission(): Promise<AlertPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showSystemNotification(title: string, body: string): void {
  if (notificationPermission() !== "granted") return;
  try {
    const n = new Notification(title, {
      body,
      icon: "/assets/img/Logo.png",
      tag: "s2ai-inbox", // collapses repeats instead of stacking
    });
    n.onclick = () => {
      window.focus();
      window.location.assign("/inbox");
      n.close();
    };
  } catch {
    // Some engines (e.g. Android Chrome) only allow notifications via a service
    // worker. The chime + in-app badge still fire, so the user is never left unaware.
  }
}
