"use client";

import { useEffect, useState } from "react";
import { BellRing, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  notificationPermission,
  playChime,
  requestNotificationPermission,
  setSoundEnabled,
  soundEnabled,
  type AlertPermission,
} from "@/lib/alerts";

// Alert controls for the inbox. Permission must be requested from a real user gesture
// (Safari enforces this), so it lives behind a button rather than firing on load.
export function AlertSettings() {
  const [permission, setPermission] = useState<AlertPermission>("default");
  const [sound, setSound] = useState(true);

  // Read browser state after mount (avoids any SSR/hydration mismatch). Deferred a
  // microtask so it lands after paint rather than cascading a synchronous re-render.
  useEffect(() => {
    let live = true;
    void (async () => {
      await Promise.resolve();
      if (!live) return;
      setPermission(notificationPermission());
      setSound(soundEnabled());
    })();
    return () => {
      live = false;
    };
  }, []);

  async function enable() {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      playChime();
      toast.success("Desktop alerts enabled");
    } else if (result === "denied") {
      toast.error("Alerts are blocked. Enable notifications for this site in your browser.");
    }
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) playChime();
  }

  return (
    <div className="border-border bg-background flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
      <div className="flex items-center gap-2">
        <BellRing className="text-primary size-4 shrink-0" aria-hidden="true" />
        <p className="text-secondary text-sm">
          {permission === "granted"
            ? "Alerts are on. You'll be notified of new messages instantly."
            : permission === "denied"
              ? "Alerts are blocked in your browser settings."
              : permission === "unsupported"
                ? "Your browser doesn't support desktop alerts therefore, the sound and badge still work."
                : "Get an instant alert when something new arrives."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? "Mute alert sound" : "Unmute alert sound"}
        >
          {sound ? (
            <Volume2 className="size-4" aria-hidden="true" />
          ) : (
            <VolumeX className="size-4" aria-hidden="true" />
          )}
          {sound ? "Sound on" : "Muted"}
        </Button>

        {permission === "default" ? (
          <Button size="sm" onClick={() => void enable()}>
            Enable alerts
          </Button>
        ) : null}
      </div>
    </div>
  );
}
