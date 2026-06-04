import { validateUploadFile } from "@/lib/upload-limits";

export function getUploadValidationError(
  formData: FormData,
  fileField: string
): string | null {
  return validateUploadFile(formData.get(fileField) as File | null);
}
