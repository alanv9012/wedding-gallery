import "server-only";
import { MockUploadStorage, type UploadStorage } from "@/lib/storage/upload-storage";
import { createPhotoRepository, type PhotoRepository } from "@/lib/repositories";
import { generateUploadFileKey } from "@/lib/services/upload-file-key";
import { validateSingleUploadFile } from "@/lib/services/upload-validation-service";
import type {
  FailedUpload,
  UploadOrchestrationResult,
  UploadRequestInput,
} from "@/lib/services/upload-types";

export type UploadService = {
  processUpload(input: UploadRequestInput): Promise<UploadOrchestrationResult>;
};

type UploadServiceDependencies = {
  storage?: UploadStorage;
  photoRepository?: PhotoRepository;
};

const shouldLogUploadDebug = process.env.NODE_ENV !== "production" || process.env.UPLOAD_DEBUG === "true";

function logUploadDebug(message: string, meta: Record<string, unknown>) {
  if (!shouldLogUploadDebug) {
    return;
  }

  console.error(`[upload-service] ${message}`, meta);
}

function isR2UploadError(
  error: unknown,
): error is {
  name: string;
  originalName: string;
  originalMessage: string;
  statusCode: number | null;
} {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    name?: unknown;
    originalName?: unknown;
    originalMessage?: unknown;
    statusCode?: unknown;
  };

  return (
    candidate.name === "R2UploadError" &&
    typeof candidate.originalName === "string" &&
    typeof candidate.originalMessage === "string" &&
    (typeof candidate.statusCode === "number" || candidate.statusCode === null)
  );
}

function formatDevR2Detail(error: unknown): string | null {
  if (!shouldLogUploadDebug || !isR2UploadError(error)) {
    return null;
  }

  const statusPart = error.statusCode ? `, status: ${error.statusCode}` : "";
  return ` (dev detail: ${error.originalName}: ${error.originalMessage}${statusPart})`;
}

export function createUploadService(dependencies?: UploadServiceDependencies): UploadService {
  const storage = dependencies?.storage ?? new MockUploadStorage();
  const photoRepository = dependencies?.photoRepository ?? createPhotoRepository();

  return {
    async processUpload(input: UploadRequestInput): Promise<UploadOrchestrationResult> {
      const successfulUploads: UploadOrchestrationResult["successfulUploads"] = [];
      const failedUploads: FailedUpload[] = [];

      for (const file of input.files) {
        const validationError = validateSingleUploadFile(file);
        if (validationError) {
          failedUploads.push({
            fileName: file.name,
            reason: validationError.code === "FILE_TOO_LARGE" ? "FILE_TOO_LARGE" : "INVALID_FILE_TYPE",
            error: validationError.message,
          });
          continue;
        }

        const fileKey = generateUploadFileKey(input.eventSlug, file.name);
        let uploadedUrl: string | null = null;

        try {
          const uploadResult = await storage.uploadFile({
            fileKey,
            mimeType: file.type,
            content: file.content,
          });
          uploadedUrl = uploadResult.url;

          try {
            const photo = await photoRepository.createPhoto({
              eventSlug: input.eventSlug,
              fileKey: uploadResult.fileKey,
              url: uploadResult.url,
              approved: true,
            });

            successfulUploads.push({
              photoId: photo.id,
              fileName: file.name,
              fileKey: uploadResult.fileKey,
              url: uploadResult.url,
              approved: photo.approved,
            });
          } catch (error) {
            logUploadDebug("Supabase metadata insert failed", {
              fileName: file.name,
              fileKey: uploadResult.fileKey,
              eventSlug: input.eventSlug,
              error: error instanceof Error ? error.message : "unknown",
            });

            try {
              await storage.deleteFile(uploadResult.fileKey);
            } catch (cleanupError) {
              logUploadDebug("R2 cleanup after metadata failure failed", {
                fileName: file.name,
                fileKey: uploadResult.fileKey,
                error: cleanupError instanceof Error ? cleanupError.message : "unknown",
              });
            }

            failedUploads.push(
              {
                fileName: file.name,
                reason: "SUPABASE_INSERT_FAILED",
                error: "Photo uploaded, but metadata could not be saved. Please try again.",
              },
            );
          }
        } catch (error) {
          logUploadDebug("R2 upload failed", {
            fileName: file.name,
            eventSlug: input.eventSlug,
            mimeType: file.type,
            uploadedUrl,
            error: isR2UploadError(error)
              ? {
                  name: error.originalName,
                  message: error.originalMessage,
                  statusCode: error.statusCode,
                }
              : error instanceof Error
                ? error.message
                : "unknown",
          });

          const devDetail = formatDevR2Detail(error);
          failedUploads.push(
            {
              fileName: file.name,
              reason: "R2_UPLOAD_FAILED",
              error: `Storage upload failed. Please try again.${devDetail ?? ""}`,
            },
          );
        }
      }

      return {
        successfulUploads,
        failedUploads,
      };
    },
  };
}
