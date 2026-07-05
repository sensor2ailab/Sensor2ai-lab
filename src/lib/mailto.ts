export interface MailDraft {
  to: string;
  subject: string;
  body: string;
}

// Builds a mailto: URL that opens the user's mail client with the draft prefilled.
// Encodes spaces as %20 and newlines as %0A so bodies render correctly.
export function mailtoHref(d: MailDraft): string {
  return (
    `mailto:${encodeURIComponent(d.to)}` +
    `?subject=${encodeURIComponent(d.subject)}` +
    `&body=${encodeURIComponent(d.body)}`
  );
}
