import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { createGalleryDataService } from "@/lib/services";

export default async function GalleryPage() {
  const galleryDataService = createGalleryDataService();
  const { photos, hasMore, nextCursorId } = await galleryDataService.getApprovedPhotosPage();

  return <GalleryGrid initialPhotos={photos} initialHasMore={hasMore} initialNextCursorId={nextCursorId} />;
}
