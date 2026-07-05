import pino from "pino";

// Structured JSON logger. We deliberately avoid the pino-pretty worker transport
// here (it does not bundle cleanly under Next); pipe `| pino-pretty` in dev if you
// want pretty output. Sentry/log drains consume the JSON in production.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: ["req.headers.authorization", "req.headers.cookie", "password", "*.password"],
});
