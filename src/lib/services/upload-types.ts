export type UploadBinaryContent = ArrayBuffer | Uint8Array;

export type UploadServiceFile = {
  name: string;
  size: number;
  type: string;
  content: UploadBinaryContent;
};

export type UploadRequestInput = {
  eventSlug: string;
  uploaderName?: string;
  files: UploadServiceFile[];
};

export type SuccessfulUpload = {
  photoId: string;
  fileName: string;
  fileKey: string;
  url: string;
  approved: boolean;
};

export type FailedUpload = {
  fileName: string;
  reason: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "MISSING_FILE" | "R2_UPLOAD_FAILED" | "SUPABASE_INSERT_FAILED";
  error: string;
};

export type UploadOrchestrationResult = {
  successfulUploads: SuccessfulUpload[];
  failedUploads: FailedUpload[];
};
