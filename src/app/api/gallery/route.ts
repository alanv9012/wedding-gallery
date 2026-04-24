import { NextResponse } from "next/server";
import { createGalleryDataService } from "@/lib/services";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cursorParam = url.searchParams.get("cursor");
    const cursor = cursorParam ? Number(cursorParam) : 0;
    const safeCursor = Number.isFinite(cursor) && cursor >= 0 ? cursor : 0;

    const galleryDataService = createGalleryDataService();
    const result = await galleryDataService.getApprovedPhotosPage({ cursor: safeCursor });

    return NextResponse.json({
      success: true,
      photos: result.photos,
      hasMore: result.hasMore,
      nextCursorId: result.nextCursorId,
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        photos: [],
        hasMore: false,
        nextCursorId: null,
        error: "Unable to load gallery photos right now.",
      },
      { status: 500 },
    );
  }
}
