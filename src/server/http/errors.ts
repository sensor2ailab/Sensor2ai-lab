// Typed application errors that map cleanly to the `{ error: { code, message, details } }`
// envelope. Thrown from services/handlers and rendered by `fail()` in respond.ts.
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  badRequest: (message = "Bad request", details?: unknown) =>
    new AppError(400, "bad_request", message, details),
  unauthorized: (message = "Authentication required") => new AppError(401, "unauthorized", message),
  forbidden: (message = "You do not have access to this resource") =>
    new AppError(403, "forbidden", message),
  notFound: (message = "Resource not found") => new AppError(404, "not_found", message),
  conflict: (message = "Resource already exists", details?: unknown) =>
    new AppError(409, "conflict", message, details),
  validation: (details: unknown, message = "Validation failed") =>
    new AppError(422, "validation", message, details),
  rateLimited: (message = "Too many requests") => new AppError(429, "rate_limited", message),
  internal: (message = "Internal server error") => new AppError(500, "internal", message),
};
