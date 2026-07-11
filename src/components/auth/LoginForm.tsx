"use client";

import { m, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, FormMessage } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { durBase, easeOut } from "@/lib/motion";

type Step = "signin" | "change-password";

export function LoginForm() {
  const { user, status, login, changePassword } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const next = params.get("next") || "/";

  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in and nothing to change: leave the login page.
  useEffect(() => {
    if (status === "authed" && user && !user.mustChangePassword && step === "signin") {
      router.replace(next);
    }
  }, [status, user, step, next, router]);

  async function onSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { user: signedIn } = await login(email, password);
      if (signedIn.mustChangePassword) setStep("change-password");
      else router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError("The new passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await changePassword(password, newPassword);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password");
    } finally {
      setBusy(false);
    }
  }

  const anim = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <m.div className="w-full max-w-md" {...anim} transition={{ duration: durBase, ease: easeOut }}>
      <div className="text-display pb-10 text-center font-bold md:pb-20">Welcome back</div>
      <Card className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <span className="bg-primary-soft text-primary-hover inline-flex size-11 items-center justify-center rounded-md">
            {step === "signin" ? (
              <LogIn className="size-6" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-6" aria-hidden="true" />
            )}
          </span>
          <h1 className="text-h3 font-semibold">
            {step === "signin" ? "Sign in" : "Set a new password"}
          </h1>
          <p className="text-secondary text-sm">
            {step === "signin"
              ? "Access the members and administration portal."
              : "For your security, choose a new password before continuing."}
          </p>
        </div>

        {error ? <FormMessage tone="error">{error}</FormMessage> : null}

        {step === "signin" ? (
          <form className="flex flex-col gap-4" onSubmit={onSignIn} noValidate>
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@iitp.ac.in"
              />
            </Field>
            <Field label="Password" htmlFor="password" required>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </Field>
            <Button type="submit" className="mt-1 w-full" loading={busy}>
              {busy ? "Signing in" : "Sign in"}
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={onChangePassword} noValidate>
            <Field
              label="New password"
              htmlFor="new-password"
              required
              hint="At least 10 characters with upper, lower, number, and symbol."
            >
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="confirm-password" required>
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <Button type="submit" className="mt-1 w-full" loading={busy}>
              {busy ? "Updating" : "Update password and continue"}
            </Button>
          </form>
        )}
      </Card>
    </m.div>
  );
}
