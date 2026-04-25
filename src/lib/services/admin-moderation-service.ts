import "server-only";
import { createPhotoRepository, type PhotoRepository } from "@/lib/repositories";
import { deleteFileFromR2 } from "@/lib/storage";
import type { Photo } from "@/types";

type AdminModerationServiceDependencies = {
  photoRepository?: PhotoRepository;
};

const shouldLogAdminDebug = process.env.NODE_ENV !== "production";

function logAdminDebug(message: string, meta: Record<string, unknown>) {
  if (!shouldLogAdminDebug) {
    return;
  }

  console.log(`[admin-moderation] ${message}`, meta);
}

export function createAdminModerationService(dependencies?: AdminModerationServiceDependencies) {
  const photoRepository = dependencies?.photoRepository ?? createPhotoRepository();

  return {
    async hidePhoto(photoId: string): Promise<Photo | null> {
      return photoRepository.updatePhotoStatus(photoId, false);
    },

    async deletePhoto(photoId: string): Promise<"deleted" | "not_found" | "db_delete_failed"> {
      logAdminDebug("Delete requested", { photoId });

      const photo = await photoRepository.getPhotoById(photoId);
      if (!photo) {
        logAdminDebug("Delete skipped, photo not found", { photoId });
        return "not_found";
      }

      logAdminDebug("Deleting R2 object", {
        photoId,
        fileKey: photo.fileKey,
      });
      await deleteFileFromR2(photo.fileKey);

      logAdminDebug("R2 delete result", {
        photoId,
        fileKey: photo.fileKey,
        success: true,
      });

      const wasDeletedInSupabase = await photoRepository.deletePhoto(photoId);
      logAdminDebug("Supabase delete result", {
        photoId,
        deleted: wasDeletedInSupabase,
      });

      if (!wasDeletedInSupabase) {
        return "db_delete_failed";
      }

      return "deleted";
    },
  };
}
