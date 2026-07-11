"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Briefcase, Loader2, MapPin, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { errorFromResponse } from "@/lib/api-error";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { MountStagger, MountStaggerItem } from "@/components/motion/Stagger";
import { ApplicationForm } from "@/components/apply/ApplicationForm";
import { JobCard } from "@/components/apply/JobCard";
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

  // Urgent, still-open roles get their own section at the top of the page.
  const urgentJobs = useMemo(() => shown.filter((j) => j.urgent && j.isOpen), [shown]);
  const otherJobs = useMemo(() => shown.filter((j) => !(j.urgent && j.isOpen)), [shown]);

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
                className={`rounded-pill inline-flex items-center gap-2 border px-3.5 py-1.5 text-sm font-medium transition-colors duration-(--dur-fast) ${
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
        <div className="flex flex-col gap-10">
          {/* Urgent hiring therefore, priority roles, surfaced first with a distinct treatment. */}
          {urgentJobs.length > 0 ? (
            <section className="flex flex-col gap-4" aria-labelledby="urgent-hiring">
              <div className="flex items-center gap-3">
                <h2 id="urgent-hiring" className="text-h3 font-semibold">
                  Urgent hiring
                </h2>
                <span className="bg-accent text-on-primary rounded-pill px-2 py-0.5 text-xs font-bold tabular-nums">
                  {urgentJobs.length}
                </span>
              </div>
              <p className="text-secondary -mt-2 text-sm">
                These roles are being filled on priority. Applications are reviewed first.
              </p>
              <MountStagger className="grid gap-5 lg:grid-cols-2">
                {urgentJobs.map((job) => (
                  <MountStaggerItem key={job.id} className="h-full">
                    <JobCard
                      job={job}
                      isAdmin={isAdmin}
                      isAnon={isAnon}
                      pending={pendingId === job.id}
                      onReview={(j) => router.push(`/admin/jobs/${j.id}`)}
                      onEdit={openEdit}
                      onToggle={(j) => void toggleOpen(j)}
                      onDelete={setDeleteTarget}
                      onApply={setApplyFor}
                      onDetail={setDetailJob}
                    />
                  </MountStaggerItem>
                ))}
              </MountStagger>
            </section>
          ) : null}

          {otherJobs.length > 0 ? (
            <section className="flex flex-col gap-4" aria-labelledby="all-positions">
              {/* Always present an h2 so the card h3s never follow the page h1 directly
                  (keeps a valid heading order); hidden visually when it's the only group. */}
              <h2
                id="all-positions"
                className={
                  urgentJobs.length > 0 ? "text-h3 font-semibold" : "sr-only"
                }
              >
                {urgentJobs.length > 0 ? "All positions" : "Open positions"}
              </h2>
              <MountStagger className="grid gap-5 lg:grid-cols-2">
                {otherJobs.map((job) => (
                  <MountStaggerItem key={job.id} className="h-full">
                    <JobCard
                      job={job}
                      isAdmin={isAdmin}
                      isAnon={isAnon}
                      pending={pendingId === job.id}
                      onReview={(j) => router.push(`/admin/jobs/${j.id}`)}
                      onEdit={openEdit}
                      onToggle={(j) => void toggleOpen(j)}
                      onDelete={setDeleteTarget}
                      onApply={setApplyFor}
                      onDetail={setDetailJob}
                    />
                  </MountStaggerItem>
                ))}
              </MountStagger>
            </section>
          ) : null}
        </div>
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
              loading={pendingId === deleteTarget?.id}
            >
              {pendingId === deleteTarget?.id ? null : (
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
