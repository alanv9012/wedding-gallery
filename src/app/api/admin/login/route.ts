import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionValue,
  getAdminSessionCookieOptions,
  isValidAdminPassword,
} from "@/lib/services/admin-auth-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password?.trim() ?? "";

  if (!password) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter the admin password.",
        error: "Please enter the admin password.",
      },
      { status: 400 },
    );
  }

  if (!isValidAdminPassword(password)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid admin password.",
        error: "Invalid admin password.",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    success: true,
    message: "Admin login successful.",
    error: null,
  });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, createAdminSessionValue(), getAdminSessionCookieOptions());
  return response;
}
