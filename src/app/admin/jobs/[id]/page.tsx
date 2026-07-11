"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { FormMessage } from "@/components/ui/Field";
import { RevealHeading } from "@/components/ui/RevealHeading";
import { formatDate } from "@/lib/format";
import { mailtoHref, type MailDraft } from "@/lib/mailto";
import type { Application, ApplicationStatus, Job } from "@/lib/api-types";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type SortKey = "name" | "date";

interface ApprovalDraftResponse {
  mailDraft: MailDraft;
  tempPassword: string | null;
  existingUser: boolean;
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-surface-2 text-secondary",
  approved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
  withdrawn: "bg-surface-2 text-muted",
};

function StatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default function JobReviewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { status, isAdmin, authFetch } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Approve (two-step) + reject dialog state.
  const [approveTarget, setApproveTarget] = useState<Application | null>(null);
  const [approveDraft, setApproveDraft] = useState<ApprovalDraftResponse | null>(null);
  const [approveStep, setApproveStep] = useState<"draft" | "confirm">("draft");
  const [draftSent, setDraftSent] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Redirect anyone who is not an admin once auth has resolved.
  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) router.replace(`/login?next=/admin/jobs/${id}`);
  }, [status, isAdmin, router, id]);

  useEffect(() => {
    if (status !== "authed" || !isAdmin) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [jobRes, appRes] = await Promise.all([
          authFetch(`/jobs/${id}`),
          authFetch(`/admin/applications?jobId=${id}&limit=100`),
        ]);
        if (!active) return;
        if (!jobRes.ok || !appRes.ok) throw new Error("load failed");
        const jobBody = (await jobRes.json()) as { job: Job };
        const appBody = (await appRes.json()) as { items: Application[] };
        if (!active) return;
        setJob(jobBody.job);
        setApps(appBody.items);
        setError(null);
      } catch {
        if (active) setError("We could not load this position. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, isAdmin, authFetch, id, reloadKey]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    for (const a of apps) {
      if (a.status === "pending") c.pending++;
      else if (a.status === "approved") c.approved++;
      else if (a.status === "rejected") c.rejected++;
    }
    return c;
  }, [apps]);

  const visible = useMemo(() => {
    const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);
    const sorted = [...filtered].sort((a, b) => {
      const cmp =
        sortKey === "name" ? a.name.localeCompare(b.name) : a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [apps, filter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  // Step 1: fetch the welcome draft (fresh credentials), open the approve dialog.
  async function startApprove(app: Application) {
    setApproveTarget(app);
    setApproveDraft(null);
    setApproveStep("draft");
    setDraftSent(false);
    setDialogError(null);
    setDialogBusy(true);
    try {
      const res = await authFetch(`/admin/applications/${app.id}/approve/draft`, {
        method: "POST",
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setDialogError(b?.error?.message ?? "Could not prepare the approval email");
        return;
      }
      setApproveDraft((await res.json()) as ApprovalDraftResponse);
    } catch {
      setDialogError("Network error, please try again");
    } finally {
      setDialogBusy(false);
    }
  }

  // Step 2: commit the approval (only enabled after the admin opens the mail draft).
  async function confirmApprove() {
    if (!approveTarget || !approveDraft) return;
    setDialogBusy(true);
    setDialogError(null);
    try {
      const res = await authFetch(`/admin/applications/${approveTarget.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempPassword: approveDraft.tempPassword }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setDialogError(b?.error?.message ?? "Approval failed");
        return;
      }
      const { id: approvedId, name } = approveTarget;
      setApproveTarget(null);
      setApproveDraft(null);
      toast.success(`${name} approved`);
      // Patch in place instead of a full refetch, so the row transitions smoothly
      // (updates its status, or animates out of a filtered view) with no skeleton flash.
      setApps((prev) =>
        prev.map((a) => (a.id === approvedId ? { ...a, status: "approved" as const } : a)),
      );
    } catch {
      setDialogError("Network error, please try again");
    } finally {
      setDialogBusy(false);
    }
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    setDialogBusy(true);
    setDialogError(null);
    try {
      const res = await authFetch(`/admin/applications/${rejectTarget.id}/reject`, {
        method: "POST",
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setDialogError(b?.error?.message ?? "Reject failed");
        return;
      }
      const { id: rejectedId, name } = rejectTarget;
      setRejectTarget(null);
      toast.success(`${name}'s application rejected`);
      setApps((prev) =>
        prev.map((a) => (a.id === rejectedId ? { ...a, status: "rejected" as const } : a)),
      );
    } catch {
      setDialogError("Network error, please try again");
    } finally {
      setDialogBusy(false);
    }
  }

  if (status === "loading" || (status === "authed" && !isAdmin) || status === "anon") {
    return (
      <Section tone="surface" className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted size-6 animate-spin" aria-hidden="true" />
      </Section>
    );
  }

  const FILTERS: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: apps.length },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <Section tone="surface" className="min-h-[70vh]">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push("/join")}
            className="text-muted hover:text-primary inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors duration-(--dur-fast)"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to positions
          </button>
          <div className="flex flex-col gap-1">
            <span
              data-reveal
              suppressHydrationWarning
              className="text-primary text-xs font-semibold tracking-[0.2em] uppercase"
            >
              Applications
            </span>
            <RevealHeading
              key={job?.title ?? "Position"}
              text={job?.title ?? "Position"}
              className="text-[clamp(1.5rem,4vw,2.25rem)]"
            />
          </div>
        </div>

        {/* Filters */}
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

        {loading ? (
          <Skeleton className="border-border h-64 border" />
        ) : error ? (
          <div className="border-border flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
            <p className="text-secondary">{error}</p>
            <Button size="sm" variant="secondary" onClick={reload}>
              Retry
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="border-border text-secondary rounded-lg border border-dashed py-16 text-center">
            No applications in this view.
          </div>
        ) : (
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full min-w-180 border-collapse text-sm">
              <thead>
                <tr className="border-border bg-surface-2/60 border-b text-left">
                  <th className="p-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      Candidate
                      <ArrowUpDown className="size-3.5" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="p-3 font-semibold">Contact</th>
                  <th className="p-3 font-semibold">Resume</th>
                  <th className="p-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort("date")}
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      Applied
                      <ArrowUpDown className="size-3.5" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                {visible.map((a) => (
                  <m.tr
                    key={a.id}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                    className="border-border/70 border-b last:border-0"
                  >
                    <td className="p-3 align-top">
                      <div className="text-foreground font-medium">{a.name}</div>
                      {a.coverLetter ? (
                        <p className="text-muted mt-1 max-w-xs text-xs whitespace-pre-line">
                          {a.coverLetter}
                        </p>
                      ) : null}
                    </td>
                    <td className="text-secondary p-3 align-top">
                      <div>{a.email}</div>
                      <div className="text-muted">{a.phone}</div>
                      {a.college ? <div className="text-muted">{a.college}</div> : null}
                    </td>
                    <td className="p-3 align-top">
                      <a
                        href={a.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover inline-flex items-center gap-1 font-medium"
                      >
                        View
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    </td>
                    <td className="text-secondary p-3 align-top whitespace-nowrap">
                      {formatDate(a.createdAt)}
                    </td>
                    <td className="p-3 align-top">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="p-3 text-right align-top">
                      {a.status === "pending" ? (
                        <div className="inline-flex gap-2">
                          <Button size="sm" onClick={() => void startApprove(a)}>
                            <Check className="size-4" aria-hidden="true" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger hover:bg-danger-soft"
                            onClick={() => {
                              setRejectTarget(a);
                              setDialogError(null);
                            }}
                          >
                            <X className="size-4" aria-hidden="true" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">Reviewed</span>
                      )}
                    </td>
                  </m.tr>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Container>

      {/* Approve: an explicit two-step flow. Step 1 sends the welcome email, step 2
          commits the approval, so the account only goes live once the mail is out. */}
      <Modal
        open={Boolean(approveTarget)}
        title={
          !approveDraft
            ? "Approve applicant"
            : approveStep === "draft"
              ? "Step 1 of 2 · Send welcome email"
              : "Step 2 of 2 · Approve"
        }
        onClose={() => setApproveTarget(null)}
      >
        <div className="flex flex-col gap-4">
          {dialogError ? <FormMessage tone="error">{dialogError}</FormMessage> : null}
          {!approveDraft ? (
            <div className="text-muted flex items-center gap-2 py-6 text-sm">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Preparing the welcome email…
            </div>
          ) : approveStep === "draft" ? (
            <>
              <p className="text-secondary text-sm">
                {approveDraft.existingUser
                  ? `${approveTarget?.name} already has an account. Open and send the note below, then continue.`
                  : `Open and send ${approveTarget?.name} their login details below, then continue to approve.`}
              </p>
              <div className="thin-scroll border-border bg-surface-2/50 max-h-48 overflow-y-auto rounded-md border p-3">
                <p className="text-muted mb-1 text-xs">
                  To: {approveDraft.mailDraft.to} · {approveDraft.mailDraft.subject}
                </p>
                <pre className="text-secondary font-sans text-xs whitespace-pre-wrap">
                  {approveDraft.mailDraft.body}
                </pre>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={mailtoHref(approveDraft.mailDraft)}
                  onClick={() => setDraftSent(true)}
                  className="border-border bg-background text-foreground hover:border-primary hover:text-primary rounded-pill inline-flex h-9 items-center gap-2 border px-4 text-sm font-medium transition-colors duration-(--dur-fast)"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  Open email draft
                </a>
                <Button size="sm" disabled={!draftSent} onClick={() => setApproveStep("confirm")}>
                  Next
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
              {!draftSent ? (
                <p className="text-muted text-xs">
                  Open the draft and send it from your mail app to continue.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-secondary text-sm">
                You have sent the welcome email to{" "}
                <span className="text-foreground font-medium">{approveTarget?.name}</span>. Approve
                now to record the decision
                {approveDraft.existingUser ? "." : " and activate their account."}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button size="sm" variant="secondary" onClick={() => setApproveStep("draft")}>
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back
                </Button>
                <Button size="sm" onClick={() => void confirmApprove()} loading={dialogBusy}>
                  {dialogBusy ? null : <Check className="size-4" aria-hidden="true" />}
                  Approve
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Reject: simple confirm. */}
      <Modal
        open={Boolean(rejectTarget)}
        title="Reject application"
        onClose={() => setRejectTarget(null)}
      >
        <div className="flex flex-col gap-5">
          {dialogError ? <FormMessage tone="error">{dialogError}</FormMessage> : null}
          <p className="text-secondary text-sm">
            Reject <span className="text-foreground font-medium">{rejectTarget?.name}</span>
            &rsquo;s application? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-danger hover:bg-danger text-on-primary"
              onClick={() => void confirmReject()}
              loading={dialogBusy}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </Section>
  );
}
