import type { ApiError } from "@/lib/api-types";

// Human labels for the fields the forms actually submit, so validation errors read
// naturally instead of exposing raw schema keys.
const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  password: "Password",
  currentPassword: "Current password",
  newPassword: "New password",
  resumeLink: "Resume link",
  coverLetter: "Cover letter",
  title: "Title",
  body: "Message",
  link: "Link",
  description: "Description",
  location: "Location",
  employmentType: "Employment type",
};

interface ValidationDetails {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}

// Turns an API error envelope into a clear, user-facing message. Validation errors
// become a readable field message; everything else uses the server message (already
// safe/generic for 5xx), so no internal detail is leaked.
export function errorMessage(
  body: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const err = (body as ApiError | null)?.error;
  if (!err) return fallback;

  if (err.code === "validation") {
    const details = err.details as ValidationDetails | undefined;
    const entry = details?.fieldErrors
      ? Object.entries(details.fieldErrors).find(([, msgs]) => msgs && msgs.length > 0)
      : undefined;
    const fieldMsg = entry?.[1]?.[0];
    if (entry && fieldMsg) {
      return `${FIELD_LABELS[entry[0]] ?? entry[0]}: ${fieldMsg}`;
    }
    const formMsg = details?.formErrors?.[0];
    if (formMsg) return formMsg;
    return "Please check your entries and try again.";
  }

  return err.message || fallback;
}

// Reads the error message straight off a failed fetch Response.
export async function errorFromResponse(
  res: Response,
  fallback = "Something went wrong. Please try again.",
): Promise<string> {
  const body = await res.json().catch(() => null);
  return errorMessage(body, fallback);
}
