"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Photo } from "@/types";
import { texts } from "@/lib/config/texts";
import { GalleryModal } from "@/components/gallery/gallery-modal";

type HomeGalleryPreviewProps = {
  photos: Photo[];
};

export function HomeGalleryPreview({ photos }: HomeGalleryPreviewProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  );

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

  return (
    <>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {photos.map((photo) => (
          <li key={photo.id} className="overflow-hidden rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedPhotoId(photo.id)}
              className="block w-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
              aria-label={texts.gallery.openAria(photo.fileKey)}
            >
              <div className="relative aspect-4/5 w-full">
                <Image
                  src={photo.url}
                  alt={texts.gallery.photoAlt(photo.fileKey)}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 48vw, 32vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selectedPhoto && (
        <GalleryModal
          imageUrl={selectedPhoto.url}
          imageAlt={texts.gallery.photoAltById(selectedPhoto.id)}
          onClose={() => setSelectedPhotoId(null)}
        />
      )}
    </>
  );
}
