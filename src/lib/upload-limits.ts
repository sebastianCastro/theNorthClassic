/** Shared limits for admin image uploads (client + server). */
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MAX_MB = 5;

export function isLocalUpload(url: string | null | undefined): boolean {
  return Boolean(url?.trim().startsWith("/uploads/"));
}

export function validateUploadFile(file: File | null): string | null {
  if (!file?.size) return null;
  if (file.size > UPLOAD_MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `La imagen pesa ${sizeMb} MB. El máximo permitido es ${UPLOAD_MAX_MB} MB. Comprime el PNG o exporta a WebP antes de subir.`;
  }
  return null;
}
