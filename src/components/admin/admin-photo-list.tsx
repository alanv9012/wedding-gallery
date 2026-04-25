"use client";

import type { Photo } from "@/types";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SuccessState } from "@/components/ui/success-state";
import { texts } from "@/lib/config/texts";

type AdminPhotoListProps = {
  photos: Photo[];
};

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return texts.admin.unknownDate;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminPhotoList({ photos }: AdminPhotoListProps) {
  const [items, setItems] = useState<Photo[]>(photos);
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  const handleHide = async (photoId: string) => {
    setBusyPhotoId(photoId);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      });
      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; photo?: Photo; error?: string }
        | null;

      if (!response.ok || !result?.success || !result.photo) {
        setFeedbackType("error");
        setFeedback(result?.error ?? texts.admin.hideFailed);
        setBusyPhotoId(null);
        return;
      }

      setItems((current) => current.map((photo) => (photo.id === photoId ? result.photo! : photo)));
      setFeedbackType("success");
      setFeedback(texts.admin.hiddenSuccess);
      setBusyPhotoId(null);
    } catch {
      setFeedbackType("error");
      setFeedback(texts.admin.hideRetry);
      setBusyPhotoId(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    setBusyPhotoId(photoId);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string; message?: string }
        | null;

      if (!response.ok || !result?.success) {
        setFeedbackType("error");
        setFeedback(result?.error ?? result?.message ?? texts.admin.deleteFailed);
        setBusyPhotoId(null);
        return;
      }

      setItems((current) => current.filter((photo) => photo.id !== photoId));
      setFeedbackType("success");
      setFeedback(texts.admin.deletedSuccess);
      setBusyPhotoId(null);
    } catch {
      setFeedbackType("error");
      setFeedback(texts.admin.deleteRetry);
      setBusyPhotoId(null);
    }
  };

  if (items.length === 0) {
    return <EmptyState title={texts.admin.noUploadsTitle} message={texts.admin.noUploadsMessage} />;
  }

  return (
    <div className="space-y-3">
      {feedback && (
        <>
          {feedbackType === "success" ? (
            <SuccessState message={feedback} />
          ) : (
            <ErrorState title={texts.admin.actionFailedTitle} message={feedback} />
          )}
        </>
      )}
      <ul className="space-y-3">
        {items.map((photo) => (
          <li key={photo.id} className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <img
                src={photo.url}
                alt={texts.admin.previewAlt(photo.fileKey)}
                loading="lazy"
                className="h-20 w-20 flex-none rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">{texts.admin.status(photo.approved)}</p>
                <p className="text-xs text-[var(--foreground)]">{texts.admin.uploadedAt(formatCreatedAt(photo.createdAt))}</p>
                <p className="truncate text-xs text-[var(--foreground)]">{texts.admin.fileKey(photo.fileKey)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleHide(photo.id)}
                    disabled={busyPhotoId === photo.id || !photo.approved}
                    className="min-h-10 rounded-lg border border-[var(--border-soft)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={texts.admin.hideAria(photo.fileKey)}
                  >
                    {texts.admin.hide}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={busyPhotoId === photo.id}
                    className="min-h-10 rounded-lg border border-[var(--border-soft)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={texts.admin.deleteAria(photo.fileKey)}
                  >
                    {texts.admin.delete}
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
