function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return "jpg";
  }

  const extension = parts[parts.length - 1]?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
}

export function generateUploadFileKey(eventSlug: string, originalFileName: string): string {
  const safeEventSlug = sanitizeSegment(eventSlug) || "event";
  const extension = extractFileExtension(originalFileName);
  const fileId = crypto.randomUUID();
  return `${safeEventSlug}/${fileId}.${extension}`;
}
