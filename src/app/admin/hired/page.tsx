"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  Bell,
  CalendarClock,
  Loader2,
  MessagesSquare,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { DatePicker } from "@/components/ui/DatePicker";
import { Field } from "@/components/ui/Field";
import { RevealHeading } from "@/components/ui/RevealHeading";
import { Combobox } from "@/components/ui/Combobox";
import { ChatThread } from "@/components/chat/ChatThread";
import { ChatThreadSkeleton } from "@/components/chat/ChatSkeleton";
import { useLiveSync } from "@/lib/use-live-sync";
import { colleges } from "@/data/colleges";
import { errorFromResponse } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ChatMessage, Hire } from "@/lib/api-types";

// yyyy-mm-dd for <input type="date"> from an ISO string (or "").
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

// Module-level so the reference is stable across renders (the Combobox debounces on
// it). Backed by the cached /colleges proxy, which falls back to the bundled list.
async function searchColleges(query: string): Promise<string[]> {
  const res = await fetch(`/api/v1/colleges?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return ((await res.json()) as { items: string[] }).items;
}

export default function HiredPage() {
  const router = useRouter();
  const { status, isAdmin, authFetch } = useAuth();

  const [hires, setHires] = useState<Hire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDate, setBulkDate] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  // Dialogs track the member by id, not by a captured object, so they always render
  // the live row (a snapshot would go stale as soon as its data changed).
  const [msgTargetId, setMsgTargetId] = useState<string | null>(null);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const msgTarget = hires.find((h) => h.userId === msgTargetId) ?? null;
  const editTarget = hires.find((h) => h.userId === editTargetId) ?? null;

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) router.replace("/login?next=/admin/hired");
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (status !== "authed" || !isAdmin) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch("/admin/hires");
        if (!active) return;
        if (!res.ok) throw new Error("load failed");
        const body = (await res.json()) as { items: Hire[] };
        if (!active) return;
        setHires(body.items);
        setError(null);
      } catch {
        if (active) setError("We could not load hired members. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, isAdmin, authFetch]);

  const allSelected = hires.length > 0 && selected.size === hires.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(hires.map((h) => h.userId)));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  function patchLocal(userId: string, patch: Partial<Hire>) {
    setHires((prev) => prev.map((h) => (h.userId === userId ? { ...h, ...patch } : h)));
  }

  // Multi-update: apply one date to every selected member.
  async function applyBulkMeeting() {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      const iso = bulkDate ? new Date(bulkDate).toISOString() : null;
      const res = await authFetch("/admin/hires/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [...selected], lastMeetingAt: iso }),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      const body = (await res.json()) as { updated: number };
      setHires((prev) =>
        prev.map((h) => (selected.has(h.userId) ? { ...h, lastMeetingAt: iso } : h)),
      );
      toast.success(`Updated ${body.updated} ${body.updated === 1 ? "member" : "members"}`);
      setSelected(new Set());
      setBulkDate("");
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setBulkBusy(false);
    }
  }

  const stats = useMemo(() => {
    const withMeeting = hires.filter((h) => h.lastMeetingAt).length;
    const unread = hires.reduce((n, h) => n + h.notifications.filter((x) => !x.readAt).length, 0);
    return { total: hires.length, withMeeting, unread };
  }, [hires]);

  if (status === "loading" || (status === "authed" && !isAdmin) || status === "anon") {
    return (
      <Section tone="surface" className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted size-6 animate-spin" aria-hidden="true" />
      </Section>
    );
  }

  return (
    <Section tone="surface" className="min-h-[70vh]">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <span
            data-reveal
            suppressHydrationWarning
            className="text-primary text-xs font-semibold tracking-[0.2em] uppercase"
          >
            Administration
          </span>
          <RevealHeading text="Hired members" className="text-[clamp(1.5rem,4vw,2.25rem)]" />
          <p className="text-secondary text-sm">
            {stats.total} members · {stats.withMeeting} with a recorded meeting · {stats.unread}{" "}
            unread notifications
          </p>
        </div>

        {/* Multi-update toolbar */}
        {selected.size > 0 ? (
          <div className="border-primary/40 bg-primary-soft/50 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3">
            <span className="text-foreground text-sm font-medium">{selected.size} selected</span>
            <div className="flex items-center gap-2">
              <CalendarClock className="text-muted size-4 shrink-0" aria-hidden="true" />
              <DatePicker
                value={bulkDate || null}
                onChange={(v) => setBulkDate(v ?? "")}
                placeholder="Meeting date"
                className="w-44"
              />
            </div>
            <Button size="sm" onClick={() => void applyBulkMeeting()} loading={bulkBusy}>
              Set meeting date
            </Button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-muted hover:text-foreground ml-auto text-sm"
            >
              Clear
            </button>
          </div>
        ) : null}

        {loading ? (
          <Skeleton className="border-border h-64 border" />
        ) : error ? (
          <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
            <p className="text-secondary">{error}</p>
          </div>
        ) : hires.length === 0 ? (
          <div className="border-border text-secondary flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
            <Bell className="text-muted size-8" aria-hidden="true" />
            <p>No hired members yet. Approve an application to add someone here.</p>
          </div>
        ) : (
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full min-w-215 border-collapse text-sm">
              <thead>
                <tr className="border-border bg-surface-2/60 border-b text-left">
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all"
                      className="accent-primary size-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 font-semibold">Member</th>
                  <th className="p-3 font-semibold">College</th>
                  <th className="p-3 font-semibold">Positions</th>
                  <th className="p-3 font-semibold">Last meeting</th>
                  <th className="p-3 text-right font-semibold">Manage</th>
                </tr>
              </thead>
              <tbody>
                {hires.map((h) => (
                  <tr key={h.userId} className="border-border/70 border-b last:border-0">
                    <td className="p-3 align-top">
                      <input
                        type="checkbox"
                        checked={selected.has(h.userId)}
                        onChange={() => toggleOne(h.userId)}
                        aria-label={`Select ${h.name}`}
                        className="accent-primary mt-1 size-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">{h.name}</span>
                        {!h.active ? (
                          <span className="bg-danger-soft text-danger rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                            Revoked
                          </span>
                        ) : null}
                      </div>
                      <div className="text-muted">{h.email}</div>
                    </td>
                    <td className="p-3 align-top">
                      {h.collegeName ? (
                        <span className="text-foreground">{h.collegeName}</span>
                      ) : (
                        <span className="text-muted">&mdash;</span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {h.jobTitles.length ? (
                          h.jobTitles.map((t) => (
                            <span
                              key={t}
                              className="bg-surface-2 text-secondary rounded-sm px-2 py-0.5 text-xs font-medium"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted text-xs">&mdash;</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 align-top whitespace-nowrap">
                      {h.lastMeetingAt ? (
                        <span className="text-secondary">{formatDate(h.lastMeetingAt)}</span>
                      ) : (
                        <span className="text-muted">&mdash;</span>
                      )}
                    </td>
                    <td className="p-3 text-right align-top">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditTargetId(h.userId)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setMsgTargetId(h.userId)}
                        >
                          <MessagesSquare className="size-4" aria-hidden="true" />
                          Message
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>

      <EditHireModal
        key={editTargetId ? `edit-${editTargetId}` : "edit-none"}
        hire={editTarget}
        onClose={() => setEditTargetId(null)}
        onSaved={(userId, patch) => patchLocal(userId, patch)}
        onAccessChange={(userId, active) => patchLocal(userId, { active })}
      />

      <MessageModal
        key={msgTargetId ?? "none"}
        hire={msgTarget}
        onClose={() => setMsgTargetId(null)}
      />
    </Section>
  );
}

// Edit a member's college and last-meeting date in a dialog (consistent with the
// rest of the admin surfaces).
function EditHireModal({
  hire,
  onClose,
  onSaved,
  onAccessChange,
}: {
  hire: Hire | null;
  onClose: () => void;
  onSaved: (
    userId: string,
    patch: { collegeName: string | null; lastMeetingAt: string | null },
  ) => void;
  onAccessChange: (userId: string, active: boolean) => void;
}) {
  const { authFetch } = useAuth();
  const [college, setCollege] = useState(hire?.collegeName ?? "");
  const [date, setDate] = useState<string | null>(
    hire ? toDateInput(hire.lastMeetingAt) || null : null,
  );
  const [busy, setBusy] = useState(false);
  const [accessBusy, setAccessBusy] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  if (!hire) return null;

  async function setAccess(active: boolean) {
    if (!hire) return;
    setAccessBusy(true);
    try {
      const res = await authFetch(`/admin/hires/${hire.userId}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      const body = (await res.json()) as { active: boolean };
      onAccessChange(hire.userId, body.active);
      setConfirmRevoke(false);
      toast.success(
        body.active
          ? "Access restored"
          : "Access revoked therefore, the member has been signed out.",
      );
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setAccessBusy(false);
    }
  }

  async function save() {
    if (!hire) return;
    setBusy(true);
    try {
      const res = await authFetch(`/admin/hires/${hire.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeName: college.trim() ? college.trim() : null,
          lastMeetingAt: date ? new Date(date).toISOString() : null,
        }),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      const body = (await res.json()) as {
        collegeName: string | null;
        lastMeetingAt: string | null;
      };
      onSaved(hire.userId, { collegeName: body.collegeName, lastMeetingAt: body.lastMeetingAt });
      toast.success("Member updated");
      onClose();
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={Boolean(hire)} title={`Edit · ${hire.name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field
          label="College"
          htmlFor="edit-college"
          hint="Search the list, or type a college if it isn’t there."
        >
          <Combobox
            id="edit-college"
            value={college}
            onChange={setCollege}
            options={colleges}
            fetchOptions={searchColleges}
            placeholder="Select or type a college"
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Last meeting</span>
          <DatePicker value={date} onChange={setDate} placeholder="Select a date" />
        </div>

        {/* Account access therefore, revoke a member's login when their term ends (bans sign-in
            and signs them out everywhere), or restore it later. */}
        <div className="border-border flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-foreground text-sm font-medium">Account access</p>
              <p className="text-muted text-xs">
                {hire.active
                  ? "The member can sign in."
                  : "Sign-in is revoked therefore, the member cannot log in."}
              </p>
            </div>
            <span
              className={cn(
                "rounded-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold",
                hire.active ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", hire.active ? "bg-success" : "bg-danger")}
              />
              {hire.active ? "Active" : "Revoked"}
            </span>
          </div>

          {hire.active ? (
            confirmRevoke ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="bg-danger hover:bg-danger text-on-primary"
                  onClick={() => void setAccess(false)}
                  loading={accessBusy}
                >
                  {accessBusy ? null : <Ban className="size-4" aria-hidden="true" />}
                  Confirm therefore, revoke access
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmRevoke(false)}
                  disabled={accessBusy}
                >
                  Keep access
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="text-danger hover:border-danger w-fit"
                onClick={() => setConfirmRevoke(true)}
              >
                <Ban className="size-4" aria-hidden="true" />
                Revoke access
              </Button>
            )
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="w-fit"
              onClick={() => void setAccess(true)}
              loading={accessBusy}
            >
              {accessBusy ? null : <ShieldCheck className="size-4" aria-hidden="true" />}
              Restore access
            </Button>
          )}
        </div>

        <div className="mt-1 flex justify-end gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={() => void save()} loading={busy}>
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Chat with a hired member from the admin side. Anything sent here lands in the
// member's conversation (not a one-off notification), so it shows up in their chat
// and pings their inbox in real time. Opening the dialog marks the thread read, and it
// stays live — the member's replies stream in over the conversation's realtime channel.
function MessageModal({ hire, onClose }: { hire: Hire | null; onClose: () => void }) {
  const { authFetch } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const userId = hire?.userId ?? null;

  // Fetch the thread (and mark the admin side read). Reused for the initial load and
  // for every realtime/poll refresh, so the modal reflects new replies without reopening.
  const load = useCallback(async () => {
    if (!userId) return;
    const res = await authFetch(`/admin/hires/${userId}/message`);
    if (!res.ok) return;
    const body = (await res.json()) as { conversationId: string; messages: ChatMessage[] };
    setConversationId(body.conversationId);
    setMessages(body.messages);
  }, [userId, authFetch]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      setLoading(true);
      await load();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [userId, load]);

  // Live: refresh whenever this conversation pings (member reply) or on the poll backstop.
  useLiveSync(conversationId ? `chat:conv:${conversationId}` : null, () => void load());

  async function send(text: string) {
    if (!userId) return;
    setSending(true);
    try {
      const res = await authFetch(`/admin/hires/${userId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      const { message } = (await res.json()) as { message: ChatMessage };
      // Guard against a realtime refresh having already merged this message (the POST
      // broadcasts, so load() can land first) — otherwise we'd duplicate the key.
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={Boolean(hire)} title={`Message · ${hire?.name ?? ""}`} onClose={onClose}>
      <div className="h-104">
        {loading ? (
          <ChatThreadSkeleton />
        ) : (
          <ChatThread
            messages={messages}
            viewerRole="admin"
            onSend={(t) => void send(t)}
            sending={sending}
            emptyHint="No messages yet. Say hello to get the conversation started."
          />
        )}
      </div>
    </Modal>
  );
}
