"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Plus,
  Send,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { errorFromResponse } from "@/lib/api-error";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { MountStagger, MountStaggerItem } from "@/components/motion/Stagger";
import { ApplicationForm } from "@/components/apply/ApplicationForm";
import { JobForm } from "@/components/apply/JobForm";
import type { Job } from "@/lib/api-types";

type JobFilter = "all" | "open" | "closed";

export function ApplyBoard() {
  const { status, isAdmin, authFetch } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applyFor, setApplyFor] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<JobFilter>("all");
  const reload = () => setReloadKey((k) => k + 1);

  const isAnon = status === "anon";

  useEffect(() => {
    if (status === "loading") return;
    let active = true;
    (async () => {
      try {
        const res = isAdmin ? await authFetch("/admin/jobs") : await fetch("/api/v1/jobs");
        if (!active) return;
        if (!res.ok) throw new Error("Failed to load positions");
        const body = (await res.json()) as { items: Job[] };
        if (!active) return;
        setJobs(body.items);
        setError(null);
      } catch {
        if (active) setError("We could not load open positions. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, isAdmin, authFetch, reloadKey]);

  const openCount = useMemo(() => jobs.filter((j) => j.isOpen).length, [jobs]);

  // Admin view: apply the open/closed filter, then always show open jobs before
  // closed ones (V8 sort is stable, so createdAt order is kept within each group).
  const shown = useMemo(() => {
    if (!isAdmin) return jobs;
    const filtered =
      filter === "all" ? jobs : jobs.filter((j) => (filter === "open" ? j.isOpen : !j.isOpen));
    return [...filtered].sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
  }, [jobs, isAdmin, filter]);

  function openCreate() {
    setEditing(null);
    setJobFormOpen(true);
  }
  function openEdit(job: Job) {
    setEditing(job);
    setJobFormOpen(true);
  }
  function onSaved() {
    setJobFormOpen(false);
    setEditing(null);
    reload();
  }

  async function toggleOpen(job: Job) {
    setPendingId(job.id);
    try {
      const res = await authFetch(`/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !job.isOpen }),
      });
      if (res.ok) {
        toast.success(job.isOpen ? "Position closed" : "Position reopened");
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    try {
      const res = await authFetch(`/jobs/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success("Position deleted");
      } else {
        toast.error(await errorFromResponse(res));
      }
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setPendingId(null);
    }
  }

  const FILTERS: { key: JobFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: jobs.length },
    { key: "open", label: "Open", count: openCount },
    { key: "closed", label: "Closed", count: jobs.length - openCount },
  ];

  return (
    <div className="-mt-10 flex flex-col gap-8">
      {isAdmin ? (
        <div className="flex flex-col gap-4">
          <div className="border-border bg-primary-soft/50 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3">
            <span className="text-secondary text-sm">
              Administrator view. Open a position to review its applications.
            </span>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              New position
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-pill inline-flex items-center gap-2 border px-3.5 py-1.5 text-sm font-medium transition-colors duration-[var(--dur-fast)] ${
                  filter === f.key
                    ? "border-primary bg-primary text-on-primary"
                    : "border-border text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-sm px-1.5 text-xs ${
                    filter === f.key ? "bg-on-primary/20" : "bg-surface-2 text-muted"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="border-border h-48 border" />
          ))}
        </div>
      ) : error ? (
        <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <p className="text-secondary">{error}</p>
          <Button size="sm" variant="secondary" onClick={reload}>
            Retry
          </Button>
        </div>
      ) : shown.length === 0 ? (
        <div className="border-ink/20 text-secondary flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <Briefcase className="text-muted size-8" aria-hidden="true" />
          <p>No positions to show.</p>
        </div>
      ) : (
        <MountStagger className="grid gap-5 lg:grid-cols-2">
          {shown.map((job) => (
            <MountStaggerItem key={job.id} className="h-full">
              <Card
                hover
                className={`flex h-full flex-col gap-5 p-6 ${isAdmin && !job.isOpen ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary-soft text-primary-hover inline-flex size-11 shrink-0 items-center justify-center rounded-md">
                      <Briefcase className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/jobs/${job.id}`)}
                          className="hover:text-primary text-left transition-colors duration-[var(--dur-fast)]"
                        >
                          <h3 className="text-h3 font-semibold">{job.title}</h3>
                        </button>
                      ) : (
                        <h3 className="text-h3 font-semibold">{job.title}</h3>
                      )}
                      <div className="text-muted flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                        {job.employmentType ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="size-3.5" aria-hidden="true" />
                            {job.employmentType}
                          </span>
                        ) : null}
                        {job.location ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" aria-hidden="true" />
                            {job.location}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {isAdmin ? (
                    <span
                      className={`rounded-pill inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${
                        job.isOpen ? "bg-success-soft text-success" : "bg-surface-2 text-muted"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${job.isOpen ? "bg-success" : "bg-muted"}`}
                      />
                      {job.isOpen ? "Open" : "Closed"}
                    </span>
                  ) : null}
                </div>

                <p className="text-secondary line-clamp-3 text-sm whitespace-pre-line">
                  {job.description}
                </p>

                {isAdmin ? (
                  <div className="border-border items-around mt-auto flex flex-col justify-between gap-2 border-t pt-4 md:flex-row md:items-center">
                    <Button size="sm" onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                      <ClipboardList className="size-4" aria-hidden="true" />
                      Review applications
                    </Button>
                    <div className="flex justify-evenly gap-1.5 pt-2 md:items-center md:pt-0">
                      <IconButton
                        label="Edit position"
                        icon={Pencil}
                        onClick={() => openEdit(job)}
                      />
                      <IconButton
                        label={job.isOpen ? "Close position" : "Reopen position"}
                        icon={job.isOpen ? ToggleRight : ToggleLeft}
                        busy={pendingId === job.id}
                        onClick={() => void toggleOpen(job)}
                      />
                      <IconButton
                        label="Delete position"
                        icon={Trash2}
                        variant="danger"
                        onClick={() => setDeleteTarget(job)}
                      />
                    </div>
                  </div>
                ) : isAnon ? (
                  <div className="border-border mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <Button size="sm" onClick={() => setApplyFor(job)}>
                      <Send className="size-4" aria-hidden="true" />
                      Apply now
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDetailJob(job)}
                      className="text-primary border-accent hover:text-primary-soft hover:bg-primary focus:text-primary-hover focus:bg-accent inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)]"
                    >
                      Read more
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="border-border mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <button
                      type="button"
                      onClick={() => setDetailJob(job)}
                      className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-sm font-medium transition-colors duration-[var(--dur-fast)]"
                    >
                      Read more
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </button>
                    <span className="text-muted inline-flex items-center gap-1.5 text-sm">
                      <Lock className="size-4" aria-hidden="true" />
                      Sign out to apply
                    </span>
                  </div>
                )}
              </Card>
            </MountStaggerItem>
          ))}
        </MountStagger>
      )}

      <Modal
        open={Boolean(detailJob)}
        title={detailJob?.title ?? "Position"}
        onClose={() => setDetailJob(null)}
      >
        {detailJob ? (
          <div className="flex flex-col gap-5">
            {detailJob.employmentType || detailJob.location ? (
              <div className="text-secondary flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {detailJob.employmentType ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="text-primary size-4" aria-hidden="true" />
                    {detailJob.employmentType}
                  </span>
                ) : null}
                {detailJob.location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="text-primary size-4" aria-hidden="true" />
                    {detailJob.location}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="thin-scroll text-secondary max-h-[45vh] overflow-y-auto text-sm leading-relaxed whitespace-pre-line">
              {detailJob.description}
            </div>
            <div className="border-border flex flex-wrap justify-end gap-3 border-t pt-4">
              <Button variant="secondary" size="sm" onClick={() => setDetailJob(null)}>
                Close
              </Button>
              {isAnon && detailJob.isOpen ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const job = detailJob;
                    setDetailJob(null);
                    setApplyFor(job);
                  }}
                >
                  <Send className="size-4" aria-hidden="true" />
                  Apply now
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(applyFor)}
        title={applyFor ? `Apply: ${applyFor.title}` : "Apply"}
        onClose={() => setApplyFor(null)}
      >
        {applyFor ? <ApplicationForm job={applyFor} onDone={() => setApplyFor(null)} /> : null}
      </Modal>

      <Modal
        open={jobFormOpen}
        title={editing ? "Edit position" : "New position"}
        onClose={() => setJobFormOpen(false)}
      >
        <JobForm editing={editing} onSaved={onSaved} onCancel={() => setJobFormOpen(false)} />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete position"
        onClose={() => setDeleteTarget(null)}
      >
        <div className="flex flex-col gap-5">
          <p className="text-secondary text-sm">
            Delete <span className="text-foreground font-medium">{deleteTarget?.title}</span>? This
            also removes all of its applications and cannot be undone.
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
