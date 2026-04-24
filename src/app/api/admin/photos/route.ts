import { NextRequest, NextResponse } from "next/server";
import { createAdminPhotoService } from "@/lib/services";
import { ensureAdminApiAccess } from "@/lib/services/admin-route-guard";

export async function GET(request: NextRequest) {
  const unauthorized = ensureAdminApiAccess(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const adminPhotoService = createAdminPhotoService();
    const photos = await adminPhotoService.getAdminPhotoList();

    return NextResponse.json({
      success: true,
      photos,
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        photos: [],
        error: "Unable to load admin photos.",
      },
      { status: 500 },
    );
  }
}
