import { unlink, mkdir, writeFile } from "fs/promises";
import path from "path";
import { UPLOAD_MAX_BYTES, isLocalUpload } from "./upload-limits";

export { UPLOAD_MAX_BYTES, UPLOAD_MAX_MB, isLocalUpload } from "./upload-limits";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export type UploadFolder = "sponsors" | "players" | "recruiters" | "teams";

export async function saveUploadedImage(
  file: File,
  folder: UploadFolder,
  entityId: string
): Promise<string> {
  if (!file.size) {
    throw new Error("No se seleccionó ningún archivo.");
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB.");
  }
  const ext = MIME_EXT[file.type];
  if (!ext) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WebP o GIF.");
  }

  const safeId = entityId.replace(/[^a-zA-Z0-9-_]/g, "");
  const filename = `${safeId}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}

export async function deleteUploadedFile(url: string | null | undefined) {
  if (!isLocalUpload(url)) return;
  const relative = url!.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relative);
  try {
    await unlink(filePath);
  } catch {
    /* file may already be gone */
  }
}

export async function resolvePhotoFromForm(
  formData: FormData,
  options: {
    entityId: string;
    folder: UploadFolder;
    existingUrl: string | null;
    fileField?: string;
    urlField?: string;
    allowExternalUrl?: boolean;
  }
): Promise<string | null> {
  const fileField = options.fileField ?? "photoFile";
  const urlField = options.urlField ?? "photoUrl";
  const file = formData.get(fileField) as File | null;
  const existing =
    (formData.get("existingPhotoUrl") as string)?.trim() ||
    options.existingUrl;

  if (file?.size) {
    if (isLocalUpload(existing)) await deleteUploadedFile(existing);
    return saveUploadedImage(file, options.folder, options.entityId);
  }

  if (options.allowExternalUrl) {
    const urlInput = (formData.get(urlField) as string)?.trim() || "";
    if (urlInput) {
      if (isLocalUpload(existing)) await deleteUploadedFile(existing);
      return urlInput;
    }
    if (isLocalUpload(existing)) return existing;
    return null;
  }

  return existing || null;
}
