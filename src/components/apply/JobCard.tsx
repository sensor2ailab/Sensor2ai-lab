"use client";

import {
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  Lock,
  MapPin,
  Pencil,
  Send,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";
import type { Job } from "@/lib/api-types";

interface Props {
  job: Job;
  isAdmin: boolean;
  isAnon: boolean;
  pending: boolean;
  onReview: (job: Job) => void;
  onEdit: (job: Job) => void;
  onToggle: (job: Job) => void;
  onDelete: (job: Job) => void;
  onApply: (job: Job) => void;
  onDetail: (job: Job) => void;
}

// A position card. Urgent, still-open roles get a distinct treatment: a warm tinted
// surface, an accent frame that animates on hover (running-border), a flame-marked
// icon and a pulsing "Urgent" pill therefore, so they read as priority at a glance without
// breaking the formal tone.
export function JobCard({
  job,
  isAdmin,
  isAnon,
  pending,
  onReview,
  onEdit,
  onToggle,
  onDelete,
  onApply,
  onDetail,
}: Props) {
  const urgent = job.urgent && job.isOpen;

  return (
    <Card
      hover
      className={cn(
        "relative flex h-full flex-col gap-5 p-6",
        isAdmin && !job.isOpen && "opacity-70",
        urgent && "running-border border-accent/50 bg-primary-soft/40 shadow-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-md",
              urgent
                ? "bg-primary running-border text-on-primary border"
                : "bg-primary-soft text-primary-hover",
            )}
          >
            <Briefcase className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => onReview(job)}
                className="hover:text-primary text-left transition-colors duration-(--dur-fast)"
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

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {urgent ? (
            <span className="bg-primary text-on-primary rounded-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold tracking-wide uppercase">
              Urgent
            </span>
          ) : null}
          {isAdmin && job.pendingCount && job.pendingCount > 0 ? (
            <span
              className="bg-primary-soft text-primary-hover ring-primary/20 rounded-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ring-1"
              aria-label={`${job.pendingCount} pending ${job.pendingCount === 1 ? "application" : "applications"}`}
            >
              <Users className="size-3.5" aria-hidden="true" />
              {job.pendingCount} pending
            </span>
          ) : null}
          {isAdmin ? (
            <span
              className={cn(
                "rounded-pill mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold",
                job.isOpen ? "bg-success-soft text-success" : "bg-surface-2 text-muted",
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", job.isOpen ? "bg-success" : "bg-muted")}
              />
              {job.isOpen ? "Open" : "Closed"}
            </span>
          ) : null}
        </div>
      </div>

      <p className="text-secondary line-clamp-3 text-sm whitespace-pre-line">{job.description}</p>

      {isAdmin ? (
        <div className="border-border mt-auto flex flex-col justify-between gap-2 border-t pt-4 md:flex-row md:items-center">
          <Button size="sm" onClick={() => onReview(job)}>
            <ClipboardList className="size-4" aria-hidden="true" />
            Review applications
          </Button>
          <div className="flex justify-evenly gap-1.5 pt-2 md:items-center md:pt-0">
            <IconButton label="Edit position" icon={Pencil} onClick={() => onEdit(job)} />
            <IconButton
              label={job.isOpen ? "Close position" : "Reopen position"}
              icon={job.isOpen ? ToggleRight : ToggleLeft}
              busy={pending}
              onClick={() => onToggle(job)}
            />
            <IconButton
              label="Delete position"
              icon={Trash2}
              variant="danger"
              onClick={() => onDelete(job)}
            />
          </div>
        </div>
      ) : isAnon ? (
        <div className="border-border mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <Button size="sm" onClick={() => onApply(job)}>
            <Send className="size-4" aria-hidden="true" />
            Apply now
          </Button>
          <button
            type="button"
            onClick={() => onDetail(job)}
            className="text-primary border-accent hover:text-on-primary hover:bg-primary focus-visible:text-on-primary focus-visible:bg-primary inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-(--dur-fast)"
          >
            Read more
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="border-border mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <button
            type="button"
            onClick={() => onDetail(job)}
            className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-sm font-medium transition-colors duration-(--dur-fast)"
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
  );
}
