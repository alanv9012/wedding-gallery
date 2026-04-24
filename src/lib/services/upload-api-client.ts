"use client";

import { texts } from "@/lib/config/texts";

export type UploadApiResponse =
  | {
      success: true;
      fileKey: string;
      url: string;
      error: null;
    }
  | {
      success: false;
      fileKey: null;
      url: null;
      error: string;
    };

type UploadApiPayload = {
  success?: boolean;
  uploadedFiles?: Array<{ fileKey?: string; url?: string }>;
  failedFiles?: Array<{
    fileName?: string;
    reason?: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "MISSING_FILE" | "R2_UPLOAD_FAILED" | "SUPABASE_INSERT_FAILED";
    error?: string;
  }>;
  message?: string | null;
};

function parseUploadApiResponse(responseText: string): UploadApiResponse {
  try {
    const parsed = JSON.parse(responseText) as UploadApiPayload;
    const firstUploaded = parsed.uploadedFiles?.[0];
    const firstFailedFileError = parsed.failedFiles?.[0]?.error;
    const firstFailedFileReason = parsed.failedFiles?.[0]?.reason;

    if (parsed.success === true && firstUploaded?.fileKey && firstUploaded?.url) {
      return {
        success: true,
        fileKey: firstUploaded.fileKey,
        url: firstUploaded.url,
        error: null,
      };
    }

    if (parsed.success === false) {
      return {
        success: false,
        fileKey: null,
        url: null,
        error:
          firstFailedFileError ??
          parsed.message ??
          (firstFailedFileReason === "INVALID_FILE_TYPE"
            ? texts.api.upload.invalidType
            : firstFailedFileReason === "FILE_TOO_LARGE"
              ? texts.api.upload.fileTooLarge
              : firstFailedFileReason === "MISSING_FILE"
                ? texts.api.upload.missingFile
                : firstFailedFileReason === "R2_UPLOAD_FAILED"
                  ? texts.api.upload.r2Failed
                  : firstFailedFileReason === "SUPABASE_INSERT_FAILED"
                    ? texts.api.upload.supabaseFailed
                    : texts.api.upload.genericFailed),
      };
    }
  } catch {
    return {
      success: false,
      fileKey: null,
      url: null,
      error: texts.api.upload.unexpectedResponse,
    };
  }

  return {
    success: false,
    fileKey: null,
    url: null,
    error: texts.api.upload.genericFailed,
  };
}

export async function uploadFileToApi(
  file: File,
  onProgress?: (progressPercent: number) => void,
): Promise<UploadApiResponse> {
  return new Promise<UploadApiResponse>((resolve) => {
    const formData = new FormData();
    formData.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.responseType = "text";
    request.timeout = 45000;

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }

      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    };

    request.onload = () => {
      const result = parseUploadApiResponse(request.responseText ?? "");
      if (request.status >= 200 && request.status < 300) {
        resolve(result);
        return;
      }

      if (!result.success && result.error) {
        resolve(result);
        return;
      }

      resolve({
        success: false,
        fileKey: null,
        url: null,
        error: texts.api.upload.genericFailed,
      });
    };

    request.onerror = () => {
      resolve({
        success: false,
        fileKey: null,
        url: null,
        error: texts.api.upload.networkFailed,
      });
    };

    request.ontimeout = () => {
      resolve({
        success: false,
        fileKey: null,
        url: null,
        error: texts.api.upload.timeoutFailed,
      });
    };

    request.send(formData);
  });
}
