"use client";

import { m, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Pencil, Plus, Trash2, Eye, EyeOff, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { errorFromResponse } from "@/lib/api-error";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { MountStagger, MountStaggerItem } from "@/components/motion/Stagger";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { formatDate } from "@/lib/format";
import { fadeUp } from "@/lib/motion";
import type { Announcement } from "@/lib/api-types";

export function AnnouncementsBoard() {
  const { status, isAdmin, authFetch } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Announcement | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Bumping this triggers a refetch from event handlers without a synchronous
  // setState in the effect body.
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  // Announcements are for signed-in members only; send anonymous visitors to login.
  useEffect(() => {
    if (status === "anon") router.replace("/login?next=/announcements");
  }, [status, router]);

  // Admins read the full list (drafts included); signed-in members see published
  // ones. Both go through authFetch since the endpoint now requires a session.
  useEffect(() => {
    if (status !== "authed") return;
    let active = true;
    (async () => {
      try {
        const res = isAdmin
          ? await authFetch("/admin/announcements")
          : await authFetch("/announcements");
        if (!active) return;
        if (!res.ok) throw new Error("Failed to load announcements");
        const body = (await res.json()) as { items: Announcement[] };
        if (!active) return;
        setItems(body.items);
        setError(null);
      } catch {
        if (active) setError("We could not load announcements. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, isAdmin, authFetch, reloadKey]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(item: Announcement) {
    setEditing(item);
    setFormOpen(true);
  }
  function onSaved() {
    setFormOpen(false);
    setEditing(null);
    reload();
  }

  async function togglePublish(item: Announcement) {
    setPendingId(item.id);
    try {
      const res = await authFetch(`/admin/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      });
      if (res.ok) {
        toast.success(item.published ? "Announcement unpublished" : "Announcement published");
        reload();
      } else {
        toast.error(await errorFromResponse(res));
      }
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setPendingId(null);
    }
  }

  async function remove() {
    if (!confirmDelete) return;
    setPendingId(confirmDelete.id);
    try {
      const res = await authFetch(`/admin/announcements/${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((a) => a.id !== confirmDelete.id));
        toast.success("Announcement deleted");
      } else {
        toast.error(await errorFromResponse(res));
      }
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setPendingId(null);
      setConfirmDelete(null);
    }
  }

  // While auth resolves, or for anonymous visitors being redirected to login.
  if (status === "loading" || status === "anon") {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="text-muted size-6 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="-mt-10 flex flex-col gap-8">
      {isAdmin ? (
        <div className="border-border bg-primary-soft/50 flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed px-4 py-3">
          <span className="text-secondary text-sm">
            You are signed in as an administrator. Changes are live.
          </span>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New announcement
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="border-border h-44 border" />
          ))}
        </div>
      ) : error ? (
        <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <p className="text-secondary">{error}</p>
          <Button size="sm" variant="secondary" onClick={reload}>
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="border-ink/20 text-secondary flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <Megaphone className="text-muted size-8" aria-hidden="true" />
          <p>No announcements yet. Check back soon.</p>
        </div>
      ) : (
        <MountStagger className="grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <MountStaggerItem key={item.id} className="h-full">
              <Card hover className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary-soft text-primary-hover inline-flex size-11 shrink-0 items-center justify-center rounded-md">
                      <Megaphone className="size-5" aria-hidden="true" />
                    </span>
                    <time className="text-muted text-xs font-semibold tracking-wide uppercase">
                      {formatDate(item.publishedAt ?? item.createdAt)}
                    </time>
                  </div>
                  {isAdmin ? (
                    <span
                      className={`rounded-pill inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${
                        item.published ? "bg-success-soft text-success" : "bg-surface-2 text-muted"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${item.published ? "bg-success" : "bg-muted"}`}
                      />
                      {item.published ? "Published" : "Draft"}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-h3 font-semibold">{item.title}</h3>
                  <p className="text-secondary line-clamp-4 text-sm whitespace-pre-line">
                    {item.body}
                  </p>
                </div>

                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-primary hover:text-primary-hover inline-flex w-fit items-center gap-1 text-sm font-medium transition-colors duration-[var(--dur-fast)] ${isAdmin ? "" : "mt-auto"}`}
                  >
                    Meeting Link
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                ) : null}

                {isAdmin ? (
                  <div className="border-border mt-auto flex items-center justify-end gap-1.5 border-t pt-4">
                    <IconButton label="Edit" icon={Pencil} onClick={() => openEdit(item)} />
                    <IconButton
                      label={item.published ? "Unpublish" : "Publish"}
                      icon={item.published ? EyeOff : Eye}
                      busy={pendingId === item.id}
                      onClick={() => void togglePublish(item)}
                    />
                    <IconButton
                      label="Delete"
                      icon={Trash2}
                      variant="danger"
                      onClick={() => setConfirmDelete(item)}
                    />
                  </div>
                ) : null}
              </Card>
            </MountStaggerItem>
          ))}
        </MountStagger>
      )}

      <Modal
        open={formOpen}
        title={editing ? "Edit announcement" : "New announcement"}
        onClose={() => setFormOpen(false)}
      >
        <AnnouncementForm editing={editing} onSaved={onSaved} onCancel={() => setFormOpen(false)} />
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        title="Delete announcement"
        onClose={() => setConfirmDelete(null)}
      >
        <m.div
          className="flex flex-col gap-5"
          variants={reduce ? undefined : fadeUp}
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <p className="text-secondary text-sm">
            This permanently removes{" "}
            <span className="text-foreground font-medium">{confirmDelete?.title}</span>. This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-danger hover:bg-danger text-on-primary"
              onClick={() => void remove()}
            >
              {pendingId === confirmDelete?.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Delete
            </Button>
          </div>
        </m.div>
      </Modal>
    </div>
  );
}
