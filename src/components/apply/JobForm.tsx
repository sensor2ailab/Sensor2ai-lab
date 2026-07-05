"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { errorFromResponse } from "@/lib/api-error";
import type { Job } from "@/lib/api-types";

interface Props {
  editing: Job | null;
  onSaved: () => void;
  onCancel: () => void;
}

// Admin create/edit form for a position.
export function JobForm({ editing, onSaved, onCancel }: Props) {
  const { authFetch } = useAuth();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [employmentType, setEmploymentType] = useState(editing?.employmentType ?? "");
  const [isOpen, setIsOpen] = useState(editing?.isOpen ?? true);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim() ? location.trim() : null,
        employmentType: employmentType.trim() ? employmentType.trim() : null,
        isOpen,
      };
      const res = editing
        ? await authFetch(`/jobs/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await authFetch("/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      toast.success(editing ? "Position updated" : "Position created");
      onSaved();
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Field label="Title" htmlFor="job-title" required>
        <Input
          id="job-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="PhD Position, Edge AI"
        />
      </Field>
      <Field label="Description" htmlFor="job-desc" required>
        <Textarea
          id="job-desc"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Responsibilities, eligibility, and how to apply."
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="job-location" hint="Optional">
          <Input
            id="job-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="IIT Patna"
          />
        </Field>
        <Field label="Employment type" htmlFor="job-type" hint="Optional">
          <Input
            id="job-type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            placeholder="Full time / PhD / Postdoc"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          className="accent-primary size-4"
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
        />
        <span className="text-foreground font-medium">Open</span>
        <span className="text-muted">accepting applications</span>
      </label>
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {editing ? "Save changes" : "Create position"}
        </Button>
      </div>
    </form>
  );
}
