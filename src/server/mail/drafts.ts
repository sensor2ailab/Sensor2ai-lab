import { env } from "@/server/config/env";
import { site } from "@/data/site";

// No email service. Admin-facing actions return a MailDraft; the admin UI opens it
// as a mailto: link and the admin sends it from their own inbox.
export interface MailDraft {
  to: string;
  subject: string;
  body: string;
}

// Single source of truth for the lab name lives in src/data/site.ts.
const LAB = site.name;
const loginUrl = () => `${env().FRONTEND_ORIGIN}/login`;

export function accountApproved(p: { to: string; name: string; tempPassword: string }): MailDraft {
  return {
    to: p.to,
    subject: `Welcome to ${LAB}: your application is approved`,
    body:
      `Hi ${p.name},\n\n` +
      `Congratulations. Your application to ${LAB} has been approved and an account has been created for you.\n\n` +
      `Sign in: ${loginUrl()}\n` +
      `Email: ${p.to}\n` +
      `Temporary password: ${p.tempPassword}\n\n` +
      `For your security you will be asked to set a new password the first time you sign in.\n\n` +
      `Warm regards,\n${LAB}`,
  };
}

export function accountApprovedExisting(p: { to: string; name: string }): MailDraft {
  return {
    to: p.to,
    subject: `Welcome to ${LAB}: your application is approved`,
    body:
      `Hi ${p.name},\n\n` +
      `Congratulations. Your application to ${LAB} has been approved.\n\n` +
      `You already have an account with us, so please sign in with your existing credentials: ${loginUrl()}\n\n` +
      `Warm regards,\n${LAB}`,
  };
}

export function accountCreated(p: { to: string; name: string; tempPassword: string }): MailDraft {
  return {
    to: p.to,
    subject: `Your ${LAB} account`,
    body:
      `Hi ${p.name},\n\n` +
      `An account has been created for you at ${LAB}.\n\n` +
      `Sign in: ${loginUrl()}\n` +
      `Email: ${p.to}\n` +
      `Temporary password: ${p.tempPassword}\n\n` +
      `Please set a new password on first sign-in.\n\n` +
      `Regards,\n${LAB}`,
  };
}

export function passwordReset(p: { to: string; name: string; tempPassword: string }): MailDraft {
  return {
    to: p.to,
    subject: `Your ${LAB} password has been reset`,
    body:
      `Hi ${p.name},\n\n` +
      `Your password has been reset by an administrator.\n\n` +
      `Sign in: ${loginUrl()}\n` +
      `Temporary password: ${p.tempPassword}\n\n` +
      `You will be asked to choose a new password on your next sign-in.\n\n` +
      `Regards,\n${LAB}`,
  };
}
