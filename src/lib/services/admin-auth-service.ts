import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { getAdminEnv } from "@/lib/config/env";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function createHashValue(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function createAdminSessionValue(): string {
  const { adminSecret } = getAdminEnv();
  return createHashValue(`admin-session:${adminSecret}`);
}

export function isValidAdminPassword(password: string): boolean {
  const { adminSecret } = getAdminEnv();
  const submittedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(adminSecret);

  if (submittedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(submittedBuffer, expectedBuffer);
}

export function isValidAdminSession(sessionValue: string | undefined): boolean {
  if (!sessionValue) {
    return false;
  }

  const currentSession = Buffer.from(sessionValue);
  const expectedSession = Buffer.from(createAdminSessionValue());

  if (currentSession.length !== expectedSession.length) {
    return false;
  }

  return timingSafeEqual(currentSession, expectedSession);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}
