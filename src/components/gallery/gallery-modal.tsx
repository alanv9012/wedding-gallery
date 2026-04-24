import { useEffect, useRef } from "react";
import { texts } from "@/lib/config/texts";

type GalleryModalProps = {
  imageUrl: string;
  imageAlt: string;
  onClose: () => void;
};

export function GalleryModal({ imageUrl, imageAlt, onClose }: GalleryModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(107,114,92,0.42)] p-4 backdrop-blur-[1px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={texts.gallery.modalTitle}
        className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-[rgba(253,253,251,0.72)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 min-h-10 rounded-full border border-[var(--accent)]/70 bg-[var(--accent-soft)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[#ece4ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={texts.gallery.modalCloseAria}
        >
          {texts.gallery.modalClose}
        </button>
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="max-h-[80vh] w-full object-contain"
        />
      </div>
    </div>
  );
}
