import { NextResponse } from "next/server";
import { uploadImagesFromRequest } from "@/lib/services/upload-request-service";

const shouldLogUploadDebug = process.env.UPLOAD_DEBUG === "true";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const entries = [...formData.getAll("file"), ...formData.getAll("files")];
    const files = entries.filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      if (shouldLogUploadDebug) {
        console.error("[upload-route] Upload request missing files");
      }
      return NextResponse.json(
        {
          success: false,
          uploadedFiles: [],
          failedFiles: [
            {
              fileName: "unknown",
              reason: "MISSING_FILE",
              error: "Please provide at least one image file.",
            },
          ],
          message: "Please provide at least one image file in the 'file' or 'files' field.",
        },
        { status: 400 },
      );
    }

    const result = await uploadImagesFromRequest(files);
    const uploadedFiles = result.successfulUploads;
    const failedFiles = result.failedUploads;
    const firstFailure = failedFiles[0] ?? null;
    const hasAnySuccess = uploadedFiles.length > 0;
    const hasAnyFailure = failedFiles.length > 0;

    if (shouldLogUploadDebug && hasAnyFailure) {
      console.error("[upload-route] Upload request had failed files", {
        failedCount: failedFiles.length,
        failedReasons: failedFiles.map((file) => file.reason),
        uploadedCount: uploadedFiles.length,
      });
    }

    if (!hasAnySuccess) {
      return NextResponse.json(
        {
          success: false,
          uploadedFiles,
          failedFiles,
          message: firstFailure?.error ?? "Upload failed. Please try again.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        uploadedFiles,
        failedFiles,
        message: hasAnyFailure
          ? "Upload completed with some issues. Please review failed files."
          : "Upload completed successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    if (shouldLogUploadDebug) {
      console.error("[upload-route] Unhandled upload route error", {
        error: error instanceof Error ? error.message : "unknown",
      });
    }

    return NextResponse.json(
      {
        success: false,
        uploadedFiles: [],
        failedFiles: [],
        message: "Something went wrong while uploading. Please try again.",
      },
      { status: 500 },
    );
  }
}
