import "server-only";
import type { UploadStorage, UploadStorageInput, UploadStorageResult } from "@/lib/storage/upload-storage";
import { deleteFileFromR2, uploadFileToR2 } from "@/lib/storage/r2";

export class R2UploadStorage implements UploadStorage {
  async uploadFile(input: UploadStorageInput): Promise<UploadStorageResult> {
    return uploadFileToR2({
      fileKey: input.fileKey,
      content: input.content,
      contentType: input.mimeType,
    });
  }

  async deleteFile(fileKey: string): Promise<void> {
    await deleteFileFromR2(fileKey);
  }
}
