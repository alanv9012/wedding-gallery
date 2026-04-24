import "server-only";
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

export function createGalleryDataService(dependencies?: GalleryDataServiceDependencies) {
  const photoRepository = dependencies?.photoRepository ?? createPhotoRepository();

  return {
    async getApprovedPhotosPage(request?: GalleryPageRequest): Promise<GalleryPageResult> {
      const pageSize = request?.pageSize ?? galleryConfig.pageSize;
      const cursor = request?.cursor ?? 0;
      const safeOffset = Math.max(0, cursor);

      const photos = await photoRepository.getApprovedPhotosPage({
        eventSlug: eventConfig.activeEventSlug,
        offset: safeOffset,
        limit: pageSize + 1,
      });

      const hasMore = photos.length > pageSize;
      const pagedPhotos = hasMore ? photos.slice(0, pageSize) : photos;
      const nextCursorId = hasMore ? String(safeOffset + pageSize) : null;

      return {
        photos: pagedPhotos,
        hasMore,
        nextCursorId,
      };
    },
  };
}
