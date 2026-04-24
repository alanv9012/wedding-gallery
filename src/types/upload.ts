export type UploadErrorCode =
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "NETWORK_ERROR"
  | "STORAGE_ERROR"
  | "UNKNOWN_ERROR";

export type UploadError = {
  code: UploadErrorCode;
  message: string;
  fileName: string;
};

export type UploadResult = {
  eventId: string;
  uploadedPhotoIds: string[];
  uploadedCount: number;
  failed: UploadError[];
};
