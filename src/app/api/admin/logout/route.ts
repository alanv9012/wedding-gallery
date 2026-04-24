import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/services/admin-auth-service";

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true, error: null });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
