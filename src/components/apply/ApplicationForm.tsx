"use client";

import { m, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { errorFromResponse } from "@/lib/api-error";
import { durBase, easeOut } from "@/lib/motion";
import type { Job } from "@/lib/api-types";

interface Props {
  job: Job;
  onDone: () => void;
}

// Public application form. The resume is a shared link (e.g. Google Drive, view
// access) rather than an upload, so there is no file handling.
export function ApplicationForm({ job, onDone }: Props) {
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      resumeLink: String(form.get("resumeLink") ?? "").trim(),
      coverLetter: String(form.get("coverLetter") ?? "").trim() || undefined,
    };
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res, "Your application could not be submitted."));
        return;
      }
      setDone(true);
      toast.success("Application submitted");
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <m.div
        className="flex flex-col items-center gap-4 py-6 text-center"
        initial={reduce ? undefined : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durBase, ease: easeOut }}
      >
        <CheckCircle2 className="text-success size-12" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h3 className="text-h3 font-semibold">Application received</h3>
          <p className="text-secondary text-sm">
            Thank you for applying to {job.title}. Our team will review your application and be in
            touch by email.
          </p>
        </div>
        <Button size="sm" onClick={onDone}>
          Done
        </Button>
      </m.div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Field label="Full name" htmlFor="app-name" required>
        <Input id="app-name" name="name" required placeholder="Your full name" />
      </Field>
      <Field label="Email" htmlFor="app-email" required>
        <Input id="app-email" name="email" type="email" required placeholder="you@example.com" />
      </Field>
      <Field label="Phone" htmlFor="app-phone" required>
        <Input id="app-phone" name="phone" required placeholder="+91 00000 00000" />
      </Field>
      <Field
        label="Resume link"
        htmlFor="app-resume"
        required
        hint="Paste a Google Drive link set to view access (anyone with the link can view)."
      >
        <Input
          id="app-resume"
          name="resumeLink"
          type="url"
          required
          placeholder="https://drive.google.com/file/d/.../view"
        />
      </Field>
      <Field label="Cover letter" htmlFor="app-cover" hint="Optional. A short note on your fit.">
        <Textarea id="app-cover" name="coverLetter" placeholder="Tell us about your background." />
      </Field>
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? "Submitting" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
