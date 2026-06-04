"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { updatePlayer } from "@/app/admin/actions";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { isLocalUpload } from "@/lib/upload-limits";
import { UPLOAD_MAX_MB } from "@/lib/upload-limits";
import { getUploadValidationError } from "./submitWithUploadCheck";

type Team = { id: string; name: string };

type PlayerPhotoFormProps = {
  playerId: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  jerseyNumber: number | null;
  teamId: string | null;
  teams: Team[];
};

export function PlayerPhotoForm({
  playerId,
  firstName,
  lastName,
  photoUrl,
  jerseyNumber,
  teamId,
  teams,
}: PlayerPhotoFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fullName = `${firstName} ${lastName}`;

  return (
    <form
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        const uploadError = getUploadValidationError(fd, "photoFile");
        if (uploadError) {
          setError(uploadError);
          return;
        }
        startTransition(async () => {
          try {
            await updatePlayer(playerId, fd);
            router.refresh();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "No se pudo guardar."
            );
          }
        });
      }}
      className="mt-8 space-y-4 rounded-lg border border-border p-6"
    >
      <input
        type="hidden"
        name="existingPhotoUrl"
        value={photoUrl ?? ""}
      />

      <div className="flex items-center gap-4">
        <PersonAvatar name={fullName} photoUrl={photoUrl} size={80} />
        <p className="text-xs text-muted">
          Enlace externo o archivo local (máx. {UPLOAD_MAX_MB} MB). El archivo
          tiene prioridad si eliges ambos.
        </p>
      </div>

      <label className="block text-xs text-muted">
        Enlace de foto (opcional)
        <input
          name="photoUrl"
          defaultValue={
            photoUrl && !isLocalUpload(photoUrl) ? photoUrl : ""
          }
          type="url"
          placeholder="https://..."
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Subir foto (opcional)
        <input
          type="file"
          name="photoFile"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 w-full text-sm text-muted file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-white"
        />
      </label>

      <label className="block text-xs text-muted">
        Nombre
        <input
          name="firstName"
          defaultValue={firstName}
          required
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Apellido
        <input
          name="lastName"
          defaultValue={lastName}
          required
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Número
        <input
          name="jerseyNumber"
          type="number"
          defaultValue={jerseyNumber ?? ""}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Equipo
        <select
          name="teamId"
          defaultValue={teamId ?? ""}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        >
          <option value="">Sin equipo</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-muted">
        La división se toma del equipo asignado.
      </p>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
