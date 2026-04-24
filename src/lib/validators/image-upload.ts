import { uploadConfig } from "@/lib/config/upload";
import { texts } from "@/lib/config/texts";

export const MAX_IMAGE_FILE_SIZE_BYTES = uploadConfig.maxUploadSizeBytes;
export const DEFAULT_ALLOWED_IMAGE_MIME_TYPES = uploadConfig.allowedImageMimeTypes;

export type UploadFileLike = {
  name: string;
  size: number;
  type: string;
};

export type ImageUploadValidationOptions = {
  allowedMimeTypes?: readonly string[];
  maxFileSizeBytes?: number;
};

export type ImageUploadValidationErrorCode =
  | "EMPTY_FILE_LIST"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE";

export type ImageUploadValidationError = {
  code: ImageUploadValidationErrorCode;
  message: string;
  fileName: string | null;
};

function createInvalidTypeError(file: UploadFileLike): ImageUploadValidationError {
  return {
    code: "INVALID_FILE_TYPE",
    fileName: file.name,
    message: `${file.name}: ${texts.api.upload.invalidType}`,
  };
}

function createFileTooLargeError(file: UploadFileLike, maxFileSizeBytes: number): ImageUploadValidationError {
  const maxSizeInMegabytes = Math.round((maxFileSizeBytes / (1024 * 1024)) * 10) / 10;
  return {
    code: "FILE_TOO_LARGE",
    fileName: file.name,
    message: `${file.name} ${texts.api.upload.fileTooLarge.replace("10 MB", `${maxSizeInMegabytes}MB`)}`,
  };
}

function createEmptyFileListError(): ImageUploadValidationError {
  return {
    code: "EMPTY_FILE_LIST",
    fileName: null,
    message: texts.api.upload.missingFile,
  };
}

function readValidationOptions(options?: ImageUploadValidationOptions) {
  return {
    allowedMimeTypes: options?.allowedMimeTypes ?? DEFAULT_ALLOWED_IMAGE_MIME_TYPES,
    maxFileSizeBytes: options?.maxFileSizeBytes ?? MAX_IMAGE_FILE_SIZE_BYTES,
  };
}

export function validateImageUploadFile(
  file: UploadFileLike,
  options?: ImageUploadValidationOptions,
): ImageUploadValidationError | null {
  const { allowedMimeTypes, maxFileSizeBytes } = readValidationOptions(options);

  if (!allowedMimeTypes.includes(file.type)) {
    return createInvalidTypeError(file);
  }

  if (file.size > maxFileSizeBytes) {
    return createFileTooLargeError(file, maxFileSizeBytes);
  }

  return null;
}

export function validateImageUploadFiles(
  files: readonly UploadFileLike[],
  options?: ImageUploadValidationOptions,
): ImageUploadValidationError[] {
  if (files.length === 0) {
    return [createEmptyFileListError()];
  }

  return files
    .map((file) => validateImageUploadFile(file, options))
    .filter((error): error is ImageUploadValidationError => error !== null);
}
