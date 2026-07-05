import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60";

interface LabelWrapProps {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

// Label + control + optional hint, kept consistent across every form.
export function Field({ label, htmlFor, hint, required, children }: LabelWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-foreground text-sm font-medium">
        {label}
        {required ? <span className="text-danger ml-0.5">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-muted text-xs">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28 resize-y", className)} {...props} />;
}

type MessageTone = "error" | "success";

// Inline form feedback, color-coded via tokens.
export function FormMessage({ tone, children }: { tone: MessageTone; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        tone === "error" ? "bg-danger-soft text-danger" : "bg-success-soft text-success",
      )}
    >
      {children}
    </p>
  );
}
