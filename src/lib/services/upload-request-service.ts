import "server-only";
import { eventConfig } from "@/lib/config/event";
import { R2UploadStorage } from "@/lib/storage";
import { createPhotoRepository } from "@/lib/repositories";
import { createUploadService } from "@/lib/services/upload-service";

type UploadRequestResult = {
  successfulUploads: Array<{
    photoId: string;
    fileName: string;
    fileKey: string;
    url: string;
    approved: boolean;
  }>;
  failedUploads: Array<{
    fileName: string;
    reason: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "MISSING_FILE" | "R2_UPLOAD_FAILED" | "SUPABASE_INSERT_FAILED";
    error: string;
  }>;
};

const uploadService = createUploadService({
  storage: new R2UploadStorage(),
  photoRepository: createPhotoRepository(),
});
const shouldLogUploadDebug = process.env.NODE_ENV !== "production" || process.env.UPLOAD_DEBUG === "true";

export async function uploadImagesFromRequest(files: File[]): Promise<UploadRequestResult> {
  if (shouldLogUploadDebug) {
    console.info("[upload-request] Using event_slug", {
      event_slug: eventConfig.activeEventSlug,
      incomingFileCount: files.length,
    });
  }

  const result = await uploadService.processUpload({
    eventSlug: eventConfig.activeEventSlug,
    files: await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        content: await file.arrayBuffer(),
      })),
    ),
  });

  if (shouldLogUploadDebug) {
    console.info("[upload-request] Upload result", {
      event_slug: eventConfig.activeEventSlug,
      successfulCount: result.successfulUploads.length,
      failedCount: result.failedUploads.length,
    });
  }

  return result;
}
