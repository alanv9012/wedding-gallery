"use client";

import { useEffect, useMemo, useState } from "react";
import type { Photo } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { GalleryModal } from "@/components/gallery/gallery-modal";
import { LoadingState } from "@/components/ui/loading-state";
import { texts } from "@/lib/config/texts";

type GalleryGridProps = {
  initialPhotos: Photo[];
  initialHasMore: boolean;
  initialNextCursorId: string | null;
};

type GalleryApiResponse = {
  success: boolean;
  photos: Photo[];
  hasMore: boolean;
  nextCursorId: string | null;
  error: string | null;
};

export function GalleryGrid({ initialPhotos, initialHasMore, initialNextCursorId }: GalleryGridProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursorId, setNextCursorId] = useState<string | null>(initialNextCursorId);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  );

  useEffect(() => {
    setPhotos(initialPhotos);
    setHasMore(initialHasMore);
    setNextCursorId(initialNextCursorId);
    setLoadMoreError(null);
  }, [initialPhotos, initialHasMore, initialNextCursorId]);

  useEffect(() => {
    if (!selectedPhotoId) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhotoId(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedPhotoId]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const cursorQuery = nextCursorId ? `?cursor=${encodeURIComponent(nextCursorId)}` : "";
      const response = await fetch(`/api/gallery${cursorQuery}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as GalleryApiResponse | null;

      if (!response.ok || !data?.success) {
        setLoadMoreError(data?.error ?? texts.gallery.loadMoreError);
        setIsLoadingMore(false);
        return;
      }

      setPhotos((current) => [...current, ...data.photos]);
      setHasMore(data.hasMore);
      setNextCursorId(data.nextCursorId);
      setIsLoadingMore(false);
    } catch {
      setLoadMoreError(texts.gallery.loadMoreError);
      setIsLoadingMore(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl tracking-tight text-[var(--foreground)]">{texts.gallery.title}</h2>
        <p className="text-sm text-[var(--foreground)] sm:text-base">{texts.gallery.description}</p>
      </div>

      {photos.length === 0 ? (
        <EmptyState
          title={texts.gallery.emptyTitle}
          message={texts.gallery.emptyMessage}
        />
      ) : (
        <ul className="columns-1 gap-4 space-y-4 sm:columns-2 sm:gap-4 sm:space-y-4 md:columns-3 md:gap-5 md:space-y-5">
          {photos.map((photo) => (
            <li key={photo.id} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setSelectedPhotoId(photo.id)}
                className="group block w-full overflow-hidden rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                aria-label={texts.gallery.openAria(photo.fileKey)}
              >
                <img
                  src={photo.url}
                  alt={texts.gallery.photoAlt(photo.fileKey)}
                  loading="lazy"
                  className="h-auto w-full rounded-xl object-contain transition duration-300 group-hover:opacity-[0.94]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedPhoto && (
        <GalleryModal
          imageUrl={selectedPhoto.url}
          imageAlt={texts.gallery.photoAltById(selectedPhoto.id)}
          onClose={() => setSelectedPhotoId(null)}
        />
      )}

      {photos.length > 0 && (
        <div className="flex flex-col items-center gap-3 pt-2">
          {loadMoreError && <ErrorState title={texts.gallery.loadMoreErrorTitle} message={loadMoreError} />}
          {hasMore ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="min-h-13 rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-6 py-3 text-base font-medium text-[var(--foreground)] transition hover:bg-[#ece4ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingMore ? texts.gallery.loadingMore : texts.gallery.loadMore}
            </button>
          ) : (
            <p className="text-sm text-[var(--foreground)]">{texts.gallery.end}</p>
          )}
          {isLoadingMore && <LoadingState message={texts.gallery.loadingState} />}
        </div>
      )}
    </section>
  );
}
