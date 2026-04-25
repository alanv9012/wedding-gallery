"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PageIntro } from "@/components/ui/page-intro";
import { useUploadFiles } from "@/components/upload/use-upload-files";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { formatFileSize } from "@/lib/utils/format-file-size";
import { SuccessState } from "@/components/ui/success-state";
import { validateImageUploadFile } from "@/lib/validators/image-upload";
import { texts } from "@/lib/config/texts";

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const {
    uploadStateById,
    isUploading,
    uploadFiles,
    clearStateForFile,
    summary,
    flowStatus,
    flowMessage,
    setFlowStatus,
    setFlowMessage,
  } = useUploadFiles();

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [selectedImages]);

  const appendFiles = (files: File[]) => {
    const nextErrors: string[] = [];
    const nextImages: SelectedImage[] = [];

    files.forEach((file) => {
      const validationError = validateImageUploadFile(file);
      if (validationError) {
        nextErrors.push(validationError.message);
        return;
      }

      const alreadySelected = selectedImages.some(
        (image) =>
          image.file.name === file.name &&
          image.file.size === file.size &&
          image.file.lastModified === file.lastModified,
      );

      if (alreadySelected) {
        return;
      }

      nextImages.push({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    setErrors(nextErrors);
    setSelectedImages((current) => [...current, ...nextImages]);
    if (nextImages.length > 0) {
      setFlowStatus("idle");
      setFlowMessage(texts.upload.ready);
    }
  };

  const onPickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    appendFiles(files);
    event.target.value = "";
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    appendFiles(files);
  };

  const removeImage = (id: string) => {
    if (isUploading) {
      return;
    }

    setSelectedImages((current) => {
      const imageToRemove = current.find((image) => image.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return current.filter((image) => image.id !== id);
    });
    clearStateForFile(id);
    setFlowStatus("idle");
    setFlowMessage(texts.upload.selectionUpdated);
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      setErrors([texts.upload.chooseAtLeastOne]);
      setFlowStatus("error");
      setFlowMessage(texts.upload.chooseAtLeastOne);
      return;
    }

    setErrors([]);
    await uploadFiles(selectedImages.map((image) => ({ id: image.id, file: image.file })));
  };

  return (
    <section className="space-y-7 pb-24 sm:space-y-8 sm:pb-0">
      <PageIntro
        title={texts.upload.title}
        description={texts.upload.description}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label={texts.upload.dropAria}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border p-7 text-center transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:p-8 ${
          isDragging
            ? "border-[var(--accent)]/55 bg-[var(--accent-soft)]/50"
            : "border-[var(--border-soft)] bg-white/92 hover:bg-[var(--accent-soft)]/28"
        }`}
      >
        <p className="text-base tracking-tight text-[var(--foreground)] sm:text-lg">{texts.upload.description}</p>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-base font-medium text-white transition duration-300 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={texts.upload.inputAria}
        >
          {texts.upload.selectPhotos}
        </button>
        <input
          id="upload-photo-input"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickerChange}
          className="hidden"
          aria-label={texts.upload.inputAria}
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl bg-[var(--accent-soft)]/70 p-4 text-sm text-[var(--foreground)]">
          <p className="font-semibold">{texts.upload.notAddedTitle}</p>
          <ul className="mt-2 space-y-1">
            {errors.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.successCount > 0 && (
        <SuccessState
          title={texts.upload.successTitle}
          message={texts.upload.successCount(summary.successCount)}
        />
      )}

      {summary.errorCount > 0 && (
        <ErrorState
          title={texts.upload.failedTitle}
          message={texts.upload.failedCount(summary.errorCount)}
        />
      )}

      {flowStatus === "uploading" || flowStatus === "validating" ? (
        <LoadingState title={flowStatus === "validating" ? texts.upload.validating : texts.upload.uploading} message={flowMessage} />
      ) : flowStatus === "success" ? (
        <SuccessState message={flowMessage} />
      ) : flowStatus === "error" ? (
        <ErrorState message={flowMessage} />
      ) : (
        <div className="rounded-xl bg-white/88 p-4 text-sm text-[var(--foreground)]">
          <p className="font-semibold">{texts.upload.idle}</p>
          <p className="mt-1">{flowMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.18em] text-[var(--foreground)]/90">
          {texts.upload.selectedPhotos} ({selectedImages.length})
        </h3>

        <button
          type="button"
          onClick={handleUpload}
          disabled={selectedImages.length === 0 || isUploading}
          className="inline-flex min-h-14 items-center justify-center rounded-full border border-[var(--accent)]/70 bg-[var(--accent-soft)] px-7 py-3 text-base font-medium text-[var(--foreground)] transition duration-300 hover:bg-[#ece4ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:bg-[#e8e3ea]"
          aria-label={texts.upload.uploadButtonAria}
        >
          {flowStatus === "validating"
            ? texts.upload.validatingButton
            : isUploading
              ? texts.upload.uploadingButton
              : texts.upload.uploadButton}
        </button>

        {selectedImages.length === 0 ? (
          <EmptyState title={texts.upload.emptyTitle} message={texts.upload.emptyMessage} />
        ) : (
          <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
            {selectedImages.map((image) => {
              const uploadState = uploadStateById[image.id];
              const progress = uploadState?.progress ?? 0;
              const isFileUploading = uploadState?.status === "uploading";
              const isFileSuccess = uploadState?.status === "success";
              const isFileError = uploadState?.status === "error";

              return (
                <li
                  key={image.id}
                  className="w-40 shrink-0 snap-start rounded-xl bg-white/92 p-2.5 sm:w-auto sm:shrink sm:p-3"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f6f6f4]">
                    <Image
                      src={image.previewUrl}
                      alt={image.file.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 220px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-[var(--foreground)] sm:text-sm">{image.file.name}</p>
                  <p className="text-xs text-[var(--foreground)]/85 sm:text-sm">{formatFileSize(image.file.size)}</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e7e2ea]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFileSuccess ? "bg-[#7f9a71]" : isFileError ? "bg-[#b08080]" : "bg-[var(--accent)]"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--foreground)] sm:text-sm">
                    {isFileUploading && texts.upload.progressUploading(progress)}
                    {isFileSuccess && texts.upload.progressSuccess}
                    {isFileError && (uploadState?.error ?? texts.upload.progressFailedFallback)}
                    {!uploadState && texts.upload.progressReady}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    disabled={isUploading}
                    className="mt-2 min-h-11 w-full rounded-full border border-[var(--accent)]/35 px-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[#f6f1f7] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={texts.upload.removeAria(image.file.name)}
                  >
                    {texts.upload.remove}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedImages.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-soft)] bg-white/95 p-3 backdrop-blur sm:hidden">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-base font-medium text-white transition duration-300 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:bg-[#b8abbc]"
            aria-label={texts.upload.uploadButtonAria}
          >
            {flowStatus === "validating"
              ? texts.upload.validatingButton
              : isUploading
                ? texts.upload.uploadingButton
                : `Subir fotos (${selectedImages.length})`}
          </button>
        </div>
      )}
    </section>
  );
}
