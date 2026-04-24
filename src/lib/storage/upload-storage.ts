import type { UploadBinaryContent } from "@/lib/services/upload-types";

export type UploadStorageInput = {
  fileKey: string;
  mimeType: string;
  content: UploadBinaryContent;
};

export type UploadStorageResult = {
  fileKey: string;
  url: string;
};

export interface UploadStorage {
  uploadFile(input: UploadStorageInput): Promise<UploadStorageResult>;
  deleteFile(fileKey: string): Promise<void>;
}

export class MockUploadStorage implements UploadStorage {
  async uploadFile(input: UploadStorageInput): Promise<UploadStorageResult> {
    void input.content;

    return {
      fileKey: input.fileKey,
      url: `https://mock-storage.local/${input.fileKey}`,
    };
  }

  async deleteFile(_fileKey: string): Promise<void> {}
}
