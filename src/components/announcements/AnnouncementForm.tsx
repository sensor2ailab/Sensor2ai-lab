"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { errorFromResponse } from "@/lib/api-error";
import type { Announcement } from "@/lib/api-types";

interface Props {
  editing: Announcement | null;
  onSaved: () => void;
  onCancel: () => void;
}

// Create/edit form for an announcement. Talks to the admin endpoints via authFetch.
export function AnnouncementForm({ editing, onSaved, onCancel }: Props) {
  const { authFetch } = useAuth();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [body, setBody] = useState(editing?.body ?? "");
  const [link, setLink] = useState(editing?.link ?? "");
  const [published, setPublished] = useState(editing?.published ?? false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        link: link.trim() ? link.trim() : null,
        published,
      };
      const res = editing
        ? await authFetch(`/admin/announcements/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await authFetch("/admin/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      toast.success(editing ? "Announcement updated" : "Announcement created");
      onSaved();
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Field label="Title" htmlFor="ann-title" required>
        <Input
          id="ann-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lab wins best-paper award"
        />
      </Field>
      <Field label="Body" htmlFor="ann-body" required>
        <Textarea
          id="ann-body"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share the details of this update."
        />
      </Field>
      <Field label="Link" htmlFor="ann-link" hint="Optional. A full URL for readers to learn more.">
        <Input
          id="ann-link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://example.edu/news/story"
        />
      </Field>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          className="accent-primary size-4"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-foreground font-medium">Published</span>
        <span className="text-muted">visible to the public</span>
      </label>
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {editing ? "Save changes" : "Publish announcement"}
        </Button>
      </div>
    </form>
  );
}
