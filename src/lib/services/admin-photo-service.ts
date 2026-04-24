import "server-only";
import { eventConfig } from "@/lib/config/event";
import { createPhotoRepository, type PhotoRepository } from "@/lib/repositories";
import type { Photo } from "@/types";

type AdminPhotoServiceDependencies = {
  photoRepository?: PhotoRepository;
};

export function createAdminPhotoService(dependencies?: AdminPhotoServiceDependencies) {
  const photoRepository = dependencies?.photoRepository ?? createPhotoRepository();

  return {
    async getAdminPhotoList(): Promise<Photo[]> {
      return photoRepository.getAllPhotos(eventConfig.activeEventSlug);
    },
  };
}
