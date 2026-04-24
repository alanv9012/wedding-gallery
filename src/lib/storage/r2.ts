import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { UploadBinaryContent } from "@/lib/services/upload-types";
import { getR2Env } from "@/lib/config/env";

let cachedR2Client: S3Client | null = null;
const shouldLogUploadDebug = process.env.NODE_ENV !== "production" || process.env.UPLOAD_DEBUG === "true";

export class R2UploadError extends Error {
  readonly statusCode: number | null;
  readonly originalName: string;
  readonly originalMessage: string;

  constructor(params: { originalName: string; originalMessage: string; statusCode: number | null }) {
    super("Storage upload failed.");
    this.name = "R2UploadError";
    this.statusCode = params.statusCode;
    this.originalName = params.originalName;
    this.originalMessage = params.originalMessage;
  }
}

function logR2Debug(message: string, meta: Record<string, unknown>) {
  if (!shouldLogUploadDebug) {
    return;
  }

  console.error(`[r2] ${message}`, meta);
}

function readErrorDetails(error: unknown): {
  name: string;
  message: string;
  statusCode: number | null;
} {
  if (!(error instanceof Error)) {
    return {
      name: "UnknownError",
      message: "Unknown error",
      statusCode: null,
    };
  }

  const metadata = (error as { $metadata?: { httpStatusCode?: number } }).$metadata;
  return {
    name: error.name || "Error",
    message: error.message || "Unknown error",
    statusCode: typeof metadata?.httpStatusCode === "number" ? metadata.httpStatusCode : null,
  };
}

export function getR2Client(): S3Client {
  if (cachedR2Client) {
    return cachedR2Client;
  }

  const env = getR2Env();
  cachedR2Client = new S3Client({
    region: "auto",
    endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  });

  return cachedR2Client;
}

export function getPublicR2Url(fileKey: string): string {
  const { r2PublicBaseUrl } = getR2Env();
  return `${r2PublicBaseUrl}/${fileKey}`;
}

export async function uploadFileToR2(input: {
  fileKey: string;
  content: UploadBinaryContent;
  contentType: string;
}): Promise<{ fileKey: string; url: string }> {
  const client = getR2Client();
  const { r2BucketName } = getR2Env();
  const body = input.content instanceof Uint8Array ? input.content : new Uint8Array(input.content);

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: input.fileKey,
        Body: body,
        ContentType: input.contentType,
      }),
    );
  } catch (error) {
    const details = readErrorDetails(error);
    logR2Debug("Upload to R2 failed", {
      fileKey: input.fileKey,
      contentType: input.contentType,
      errorName: details.name,
      errorMessage: details.message,
      statusCode: details.statusCode,
    });
    throw new R2UploadError({
      originalName: details.name,
      originalMessage: details.message,
      statusCode: details.statusCode,
    });
  }

  return {
    fileKey: input.fileKey,
    url: getPublicR2Url(input.fileKey),
  };
}

export async function deleteFileFromR2(fileKey: string): Promise<void> {
  const client = getR2Client();
  const { r2BucketName } = getR2Env();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: r2BucketName,
        Key: fileKey,
      }),
    );
  } catch (error) {
    logR2Debug("Delete from R2 failed", {
      fileKey,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw new Error("Storage delete failed.");
  }
}
