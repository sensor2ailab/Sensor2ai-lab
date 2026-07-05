import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { logger } from "@/server/logging/logger";

type Handler = (req: Request, ctx: RouteContext) => Promise<Response> | Response;
interface RouteContext {
  params: Promise<Record<string, string>>;
}

// Renders any thrown value into the standard error envelope. Unexpected errors
// are logged and returned as a generic 500 (never leaking internals).
export function fail(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "validation", message: "Validation failed", details: error.flatten() } },
      { status: 422 },
    );
  }
  logger.error({ err: error }, "Unhandled route error");
  return NextResponse.json(
    { error: { code: "internal", message: "Internal server error" } },
    { status: 500 },
  );
}

// Wraps a route handler so thrown AppError/ZodError/unknowns become clean responses.
export function route(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return fail(error);
    }
  };
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}
