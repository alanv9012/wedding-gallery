"use client";

import { useMemo, useState } from "react";
import { texts } from "@/lib/config/texts";
import { uploadFileToApi } from "@/lib/services/upload-api-client";
import { optimizeImageFile } from "@/lib/utils/image-optimizer";
import { validateImageUploadFile } from "@/lib/validators/image-upload";

export type UploadState = {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error: string | null;
  fileKey: string | null;
  url: string | null;
};

export type UploadStateMap = Record<string, UploadState>;
export type UploadFlowStatus = "idle" | "validating" | "uploading" | "success" | "error";

const defaultUploadState: UploadState = {
  status: "idle",
  progress: 0,
  error: null,
  fileKey: null,
  url: null,
};

type UploadFileInput = {
  id: string;
  file: File;
};

export function useUploadFiles() {
  const [stateById, setStateById] = useState<UploadStateMap>({});
  const [isUploading, setIsUploading] = useState(false);
  const [flowStatus, setFlowStatus] = useState<UploadFlowStatus>("idle");
  const [flowMessage, setFlowMessage] = useState<string>(texts.upload.ready);

  const updateState = (id: string, next: Partial<UploadState>) => {
    setStateById((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? defaultUploadState),
        ...next,
      },
    }));
  };

  const uploadFiles = async (items: UploadFileInput[]) => {
    if (items.length === 0 || isUploading) {
      setFlowStatus("error");
      setFlowMessage(texts.upload.chooseAtLeastOne);
      return;
    }

    setFlowStatus("validating");
    setFlowMessage(texts.upload.optimizing);
    await Promise.resolve();

    const optimizationResults = await Promise.all(
      items.map(async (item) => {
        const optimized = await optimizeImageFile(item.file);
        const optimizedValidationError = validateImageUploadFile(optimized.file);
        const fallbackFile = optimizedValidationError ? item.file : optimized.file;
        const finalValidationError = validateImageUploadFile(fallbackFile);

        if (process.env.NODE_ENV !== "production") {
          const originalSizeKb = Math.round(item.file.size / 1024);
          const optimizedSizeKb = Math.round(optimized.file.size / 1024);
          const finalSizeKb = Math.round(fallbackFile.size / 1024);
          const optimizedFormat = optimized.file.type || "unknown";
          console.info("[upload-optimizer]", {
            originalSizeKb,
            optimizedSizeKb,
            finalSizeKb,
            optimizedFormat,
            usedFallback: fallbackFile === item.file && optimized.file !== item.file,
            warning: optimized.warning,
          });
        }

        return {
          id: item.id,
          file: fallbackFile,
          validationError: finalValidationError?.message ?? null,
        };
      }),
    );

    setIsUploading(true);
    setFlowStatus("uploading");
    setFlowMessage(texts.upload.uploadingKeepOpen);

    let successCount = 0;
    let errorCount = 0;

    for (const item of optimizationResults) {
      if (item.validationError) {
        errorCount += 1;
        updateState(item.id, {
          status: "error",
          progress: 0,
          error: item.validationError,
          fileKey: null,
          url: null,
        });
        continue;
      }

      updateState(item.id, {
        status: "uploading",
        progress: 0,
        error: null,
      });

      const result = await uploadFileToApi(item.file, (progress) => {
        updateState(item.id, { progress });
      });

      if (result.success) {
        successCount += 1;
        updateState(item.id, {
          status: "success",
          progress: 100,
          fileKey: result.fileKey,
          url: result.url,
          error: null,
        });
      } else {
        errorCount += 1;
        updateState(item.id, {
          status: "error",
          progress: 0,
          error: result.error,
          fileKey: null,
          url: null,
        });
      }
    }

    setIsUploading(false);

    if (errorCount === 0) {
      setFlowStatus("success");
      setFlowMessage(texts.upload.flowAllSuccess(successCount));
      return;
    }

    setFlowStatus("error");
    setFlowMessage(texts.upload.flowWithIssues(successCount, errorCount));
  };

  const clearStateForFile = (id: string) => {
    setStateById((current) => {
      if (!current[id]) {
        return current;
      }

      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const summary = useMemo(() => {
    const entries = Object.values(stateById);
    const successCount = entries.filter((item) => item.status === "success").length;
    const errorCount = entries.filter((item) => item.status === "error").length;
    return { successCount, errorCount };
  }, [stateById]);

  return {
    uploadStateById: stateById,
    isUploading,
    flowStatus,
    flowMessage,
    uploadFiles,
    clearStateForFile,
    summary,
    setFlowStatus,
    setFlowMessage,
  };
}
