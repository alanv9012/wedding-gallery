const MAX_WIDTH_PX = 1800;
const OUTPUT_QUALITY = 0.8;
const WEBP_MIME_TYPE = "image/webp";

export type OptimizedImageResult = {
  file: File;
  warning: string | null;
  convertedToWebp: boolean;
  resized: boolean;
};

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function stripExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return fileName;
  }
  return fileName.slice(0, lastDotIndex);
}

function createOutputName(originalName: string, convertedToWebp: boolean): string {
  if (!convertedToWebp) {
    return originalName;
  }
  return `${stripExtension(originalName)}.webp`;
}

function readImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not decode image."));
    };

    image.src = objectUrl;
  });
}

function shouldConvertToWebp(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL(WEBP_MIME_TYPE).startsWith(`data:${WEBP_MIME_TYPE}`);
  } catch {
    return false;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export async function optimizeImageFile(file: File): Promise<OptimizedImageResult> {
  if (!isImageFile(file)) {
    return {
      file,
      warning: "File is not an image.",
      convertedToWebp: false,
      resized: false,
    };
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      file,
      warning: "Image optimization only runs in the browser.",
      convertedToWebp: false,
      resized: false,
    };
  }

  try {
    const image = await readImageFromFile(file);
    const originalWidth = image.naturalWidth || image.width;
    const originalHeight = image.naturalHeight || image.height;

    if (!originalWidth || !originalHeight) {
      return {
        file,
        warning: "Could not determine image dimensions.",
        convertedToWebp: false,
        resized: false,
      };
    }

    const resized = originalWidth > MAX_WIDTH_PX;
    const outputWidth = resized ? MAX_WIDTH_PX : originalWidth;
    const outputHeight = Math.round((originalHeight / originalWidth) * outputWidth);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return {
        file,
        warning: "Canvas is not available in this browser.",
        convertedToWebp: false,
        resized: false,
      };
    }

    context.drawImage(image, 0, 0, outputWidth, outputHeight);

    const convertedToWebp = shouldConvertToWebp();
    const outputType = convertedToWebp ? WEBP_MIME_TYPE : file.type || "image/jpeg";
    const blob = await canvasToBlob(canvas, outputType, OUTPUT_QUALITY);

    const optimizedFile = new File([blob], createOutputName(file.name, convertedToWebp), {
      type: outputType,
      lastModified: Date.now(),
    });

    return {
      file: optimizedFile,
      warning: null,
      convertedToWebp,
      resized,
    };
  } catch {
    return {
      file,
      warning: "Image optimization failed. Using original file.",
      convertedToWebp: false,
      resized: false,
    };
  }
}
