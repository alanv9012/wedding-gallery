import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Photo } from "@/types";
import { eventConfig } from "@/lib/config/event";
import { galleryConfig } from "@/lib/config/gallery";
import { createPhotoRepository, type PhotoRepository } from "@/lib/repositories";

export type GalleryPageRequest = {
  cursor?: number;
  pageSize?: number;
};

export type GalleryPageResult = {
  photos: Photo[];
  hasMore: boolean;
  nextCursorId: string | null;
};

type GalleryDataServiceDependencies = {
  photoRepository?: PhotoRepository;
};
const shouldLogGalleryDebug = process.env.NODE_ENV !== "production" || process.env.UPLOAD_DEBUG === "true";

export function createGalleryDataService(dependencies?: GalleryDataServiceDependencies) {
  const photoRepository = dependencies?.photoRepository ?? createPhotoRepository();

  return {
    async getApprovedPhotosPage(request?: GalleryPageRequest): Promise<GalleryPageResult> {
      noStore();

      const pageSize = request?.pageSize ?? galleryConfig.pageSize;
      const cursor = request?.cursor ?? 0;
      const safeOffset = Math.max(0, cursor);

      if (shouldLogGalleryDebug) {
        console.info("[gallery-data] Fetch called", {
          event_slug: eventConfig.activeEventSlug,
          requestedOffset: safeOffset,
          requestedPageSize: pageSize,
        });
      }

      const photos = await photoRepository.getApprovedPhotosPage({
        eventSlug: eventConfig.activeEventSlug,
        offset: safeOffset,
        limit: pageSize + 1,
      });

      const hasMore = photos.length > pageSize;
      const pagedPhotos = hasMore ? photos.slice(0, pageSize) : photos;
      const nextCursorId = hasMore ? String(safeOffset + pageSize) : null;

      if (shouldLogGalleryDebug) {
        console.info("[gallery-data] Approved photos page", {
          event_slug: eventConfig.activeEventSlug,
          requestedOffset: safeOffset,
          requestedPageSize: pageSize,
          queryCount: photos.length,
          returnedCount: pagedPhotos.length,
          returnedIds: pagedPhotos.map((photo) => photo.id),
        });
      }

      return {
        photos: pagedPhotos,
        hasMore,
        nextCursorId,
      };
    },
  };
}
