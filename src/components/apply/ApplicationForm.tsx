"use client";

import { m, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Combobox } from "@/components/ui/Combobox";
import { colleges } from "@/data/colleges";
import { errorFromResponse } from "@/lib/api-error";
import { durBase, easeOut } from "@/lib/motion";
import type { Job } from "@/lib/api-types";

// Module-level so the reference is stable across renders (the Combobox debounces on it).
// Backed by our cached /colleges proxy, which itself falls back to the bundled list.
async function searchColleges(query: string): Promise<string[]> {
  const res = await fetch(`/api/v1/colleges?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("college lookup failed");
  return ((await res.json()) as { items: string[] }).items;
}

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
  const [college, setCollege] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!college.trim()) {
      toast.error("Please select or enter your college.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      college: college.trim(),
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
        label="College"
        htmlFor="app-college"
        required
        hint="Search the list, or type your college if it isn’t there."
      >
        <Combobox
          id="app-college"
          value={college}
          onChange={setCollege}
          options={colleges}
          fetchOptions={searchColleges}
          placeholder="Select or type your college"
        />
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
        <Button type="submit" size="sm" loading={busy}>
          {busy ? "Submitting" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
