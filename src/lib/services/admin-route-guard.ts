import "server-only";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, isValidAdminSession } from "@/lib/services/admin-auth-service";

function readCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return rest.join("=");
    }
  }

  return undefined;
}

export function ensureAdminApiAccess(request: Request): NextResponse | null {
  const cookieValue = readCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE_NAME);
  if (isValidAdminSession(cookieValue)) {
    return null;
  }

  return NextResponse.json(
    {
      success: false,
      message: "Unauthorized admin access.",
      error: "Unauthorized admin access.",
    },
    { status: 401 },
  );
}
