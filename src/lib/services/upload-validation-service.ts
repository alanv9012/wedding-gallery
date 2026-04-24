import type { UploadError } from "@/types";
import {
  validateImageUploadFile,
  validateImageUploadFiles,
  type UploadFileLike,
} from "@/lib/validators";

type ValidationResult = {
  isValid: boolean;
  errors: UploadError[];
};

function toUploadErrorCode(code: string): UploadError["code"] {
  if (code === "INVALID_FILE_TYPE" || code === "FILE_TOO_LARGE") {
    return code;
  }

  return "UNKNOWN_ERROR";
}

export function validateUploadInput(files: readonly UploadFileLike[]): ValidationResult {
  const validationErrors = validateImageUploadFiles(files);

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors.map((error) => ({
      code: toUploadErrorCode(error.code),
      message: error.message,
      fileName: error.fileName ?? "Unknown file",
    })),
  };
}

export function validateSingleUploadFile(file: UploadFileLike): UploadError | null {
  const validationError = validateImageUploadFile(file);
  if (!validationError) {
    return null;
  }

  return {
    code: toUploadErrorCode(validationError.code),
    message: validationError.message,
    fileName: validationError.fileName ?? file.name,
  };
}
