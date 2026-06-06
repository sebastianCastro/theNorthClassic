import { timingSafeEqual } from "crypto";

export function verifyBulkDeletePassword(input: string): void {
  const expected = process.env.ADMIN_BULK_DELETE_PASSWORD?.trim();
  if (!expected) {
    throw new Error(
      "La eliminación masiva no está configurada. Contacte al administrador del sitio.",
    );
  }

  const provided = input.trim();
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Contraseña de confirmación incorrecta.");
  }
}
