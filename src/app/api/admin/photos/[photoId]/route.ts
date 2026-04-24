import { NextResponse } from "next/server";
import { ensureAdminApiAccess } from "@/lib/services/admin-route-guard";
import { createAdminModerationService } from "@/lib/services";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const unauthorized = ensureAdminApiAccess(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { photoId } = await params;
  const body = (await request.json().catch(() => null)) as { approved?: boolean } | null;

  if (typeof body?.approved !== "boolean") {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid moderation request.",
      },
      { status: 400 },
    );
  }

  try {
    const adminModerationService = createAdminModerationService();
    const updatedPhoto = body.approved
      ? null
      : await adminModerationService.hidePhoto(photoId);

    if (body.approved) {
      return NextResponse.json(
        {
          success: false,
          error: "Approve action is not enabled in this admin UI.",
        },
        { status: 400 },
      );
    }

    if (!updatedPhoto) {
      return NextResponse.json(
        {
          success: false,
          error: "Photo not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      photo: updatedPhoto,
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to update photo status.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const unauthorized = ensureAdminApiAccess(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { photoId } = await params;

  try {
    const adminModerationService = createAdminModerationService();
    const result = await adminModerationService.deletePhoto(photoId);

    if (result === "not_found") {
      return NextResponse.json(
        {
          success: false,
          message: "Photo not found.",
          error: "Photo not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully.",
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete photo.",
        error: "Unable to delete photo.",
      },
      { status: 500 },
    );
  }
}
