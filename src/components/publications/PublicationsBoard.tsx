"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { errorFromResponse } from "@/lib/api-error";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { MountStagger, MountStaggerItem } from "@/components/motion/Stagger";
import { PubItem } from "@/components/publications/PubItem";
import { PublicationForm } from "@/components/publications/PublicationForm";
import { pubTypeLabel } from "@/lib/publication";
import type { Publication } from "@/lib/api-types";

const PAGE = 60;

interface PubPage {
  items: Publication[];
  nextCursor: string | null;
}

export function PublicationsBoard() {
  const { isAdmin, authFetch } = useAuth();

  const [pubs, setPubs] = useState<Publication[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => {
    setPubs([]);
    setCursor(null);
    setReloadKey((k) => k + 1);
  };

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/publications?limit=${PAGE}`);
        if (!active) return;
        if (!res.ok) throw new Error("load failed");
        const body = (await res.json()) as PubPage;
        if (!active) return;
        setPubs(body.items);
        setCursor(body.nextCursor);
        setError(null);
      } catch {
        if (active) setError("We could not load publications. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/v1/publications?limit=${PAGE}&cursor=${encodeURIComponent(cursor)}`,
      );
      if (res.ok) {
        const body = (await res.json()) as PubPage;
        setPubs((prev) => [...prev, ...body.items]);
        setCursor(body.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  const types = useMemo(() => {
    const set = new Set(pubs.map((p) => pubTypeLabel(p.entryType)));
    return ["All", ...Array.from(set).sort()];
  }, [pubs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pubs.filter((p) => {
      const matchType = type === "All" || pubTypeLabel(p.entryType) === type;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.join(", ").toLowerCase().includes(q) ||
        (p.venue ?? "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [pubs, search, type]);

  const years = useMemo(
    () => Array.from(new Set(filtered.map((p) => p.year ?? 0))).sort((a, b) => b - a),
    [filtered],
  );

  const stats = useMemo(() => {
    const yearsCount = new Set(pubs.map((p) => p.year).filter(Boolean)).size;
    const venues = new Set(pubs.map((p) => p.venue).filter(Boolean)).size;
    const latest = pubs.reduce((m, p) => Math.max(m, p.year ?? 0), 0);
    return [
      { label: "Publications", value: String(pubs.length) },
      { label: "Venues", value: String(venues) },
      { label: "Years", value: String(yearsCount) },
      { label: "Latest", value: latest ? String(latest) : "N/A" },
    ];
  }, [pubs]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    try {
      const res = await authFetch(`/publications/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setPubs((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success("Publication deleted");
      } else {
        toast.error(await errorFromResponse(res));
      }
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
        <p className="text-secondary">{error}</p>
        <Button size="sm" variant="secondary" onClick={reload}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="-mt-10 flex flex-col gap-12">
      {isAdmin ? (
        <div className="border-border bg-primary-soft/50 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3">
          <span className="text-secondary text-sm">
            Administrator view. Add a publication from a BibTeX entry.
          </span>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add publication
          </Button>
        </div>
      ) : null}

      {/* Overview stats */}
      <MountStagger className="border-border grid grid-cols-2 border-t border-l sm:grid-cols-4">
        {stats.map((stat) => (
          <MountStaggerItem
            key={stat.label}
            className="border-border bg-background hover:bg-primary-soft flex flex-col gap-2 border-r border-b p-6 transition-colors duration-[var(--dur-fast)]"
          >
            <span className="text-muted text-xs font-semibold tracking-[0.18em] uppercase">
              {stat.label}
            </span>
            <span className="text-4xl font-extrabold tabular-nums">{stat.value}</span>
          </MountStaggerItem>
        ))}
      </MountStagger>

      {/* Search + type filters */}
      {pubs.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search
              className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author, or venue"
              aria-label="Search publications"
              className="border-border bg-background text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/25 w-full rounded-md border py-2.5 pr-3.5 pl-9 text-sm transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:ring-2 focus:outline-none"
            />
          </div>
          {types.length > 2 ? (
            <div className="flex flex-wrap items-center gap-2">
              {types.map((t) => (
                <Chip key={t} active={t === type} onClick={() => setType(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          ) : null}
          <p className="text-muted text-sm">
            Showing {filtered.length} of {pubs.length} publications
          </p>
        </div>
      ) : null}

      {/* Timeline */}
      {pubs.length === 0 ? (
        <div className="border-border text-secondary flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="text-muted size-8" aria-hidden="true" />
          <p>No publications yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-secondary">No publications match these filters.</p>
      ) : (
        <div className="flex flex-col gap-16">
          {years.map((year) => {
            const yearPubs = filtered.filter((p) => (p.year ?? 0) === year);
            return (
              <div key={year} className="grid gap-6 lg:grid-cols-[9rem_1fr] lg:gap-12">
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <span className="font-display text-primary text-5xl font-extrabold lg:text-6xl">
                    {year === 0 ? "Undated" : year}
                  </span>
                  <p className="text-muted mt-1 text-sm">
                    {yearPubs.length} {yearPubs.length === 1 ? "paper" : "papers"}
                  </p>
                </div>
                <MountStagger className="divide-border flex flex-col divide-y">
                  {yearPubs.map((pub) => (
                    <MountStaggerItem key={pub.id}>
                      <PubItem
                        pub={pub}
                        isAdmin={isAdmin}
                        onEdit={(p) => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                        onDelete={setDeleteTarget}
                      />
                    </MountStaggerItem>
                  ))}
                </MountStagger>
              </div>
            );
          })}
        </div>
      )}

      {cursor ? (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={() => void loadMore()}>
            {loadingMore ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Load more
          </Button>
        </div>
      ) : null}

      <Modal
        open={formOpen}
        title={editing ? "Edit publication" : "Add publication"}
        onClose={() => setFormOpen(false)}
      >
        <PublicationForm
          editing={editing}
          onSaved={() => {
            setFormOpen(false);
            setEditing(null);
            reload();
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete publication"
        onClose={() => setDeleteTarget(null)}
      >
        <div className="flex flex-col gap-5">
          <p className="text-secondary text-sm">
            Delete <span className="text-foreground font-medium">{deleteTarget?.title}</span>? This
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-danger hover:bg-danger text-on-primary"
              onClick={() => void confirmDelete()}
            >
              {pendingId === deleteTarget?.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
