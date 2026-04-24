import "server-only";
import { createPhotoRepository, type PhotoRepository } from "@/lib/repositories";
import { deleteFileFromR2 } from "@/lib/storage";
import type { Photo } from "@/types";

type AdminModerationServiceDependencies = {
  photoRepository?: PhotoRepository;
};

export function createAdminModerationService(dependencies?: AdminModerationServiceDependencies) {
  const photoRepository = dependencies?.photoRepository ?? createPhotoRepository();

  return {
    async hidePhoto(photoId: string): Promise<Photo | null> {
      return photoRepository.updatePhotoStatus(photoId, false);
    },

    async deletePhoto(photoId: string): Promise<"deleted" | "not_found"> {
      const photo = await photoRepository.getPhotoById(photoId);
      if (!photo) {
        return "not_found";
      }

      await deleteFileFromR2(photo.fileKey);
      await photoRepository.deletePhoto(photoId);
      return "deleted";
    },
  };
}
