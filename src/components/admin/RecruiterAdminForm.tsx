"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import {
  upsertRecruiter,
  deleteRecruiter,
  saveRecruiterDisplaySlots,
  createEmptyRecruiter,
} from "@/app/admin/actions";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { Plus } from "lucide-react";
import { UPLOAD_MAX_MB } from "@/lib/upload-limits";
import { getUploadValidationError } from "./submitWithUploadCheck";

type Recruiter = {
  id: string;
  name: string;
  teamName: string;
  description: string;
  photoUrl: string | null;
  sortOrder: number;
};

export function RecruiterAdminForm({
  recruiters,
  displaySlots,
}: {
  recruiters: Recruiter[];
  displaySlots: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slots, setSlots] = useState(displaySlots);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="font-semibold text-white">Espacios en torneo</h2>
        <p className="mt-1 text-sm text-muted">
          Cuántos perfiles mostrar en la página del torneo (máx. 20).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="block text-xs text-muted">
            Espacios a mostrar
            <input
              type="number"
              min={1}
              max={20}
              value={slots}
              onChange={(e) => setSlots(parseInt(e.target.value, 10) || 1)}
              className="mt-1 w-24 rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await saveRecruiterDisplaySlots(slots);
                setMessage("Espacios actualizados.");
                router.refresh();
              })
            }
            className="btn-secondary text-sm"
          >
            Guardar espacios
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Registrados: {recruiters.length} · Mostrando en torneo:{" "}
          {Math.min(recruiters.length, slots)}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-white">
          Reclutadores ({recruiters.length})
        </h2>
        {recruiters.map((r, index) => (
          <form
            key={r.id}
            encType="multipart/form-data"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              setMessage(null);
              const fd = new FormData(e.currentTarget);
              fd.set("id", r.id);
              const uploadError = getUploadValidationError(fd, "photoFile");
              if (uploadError) {
                setError(uploadError);
                return;
              }
              startTransition(async () => {
                try {
                  await upsertRecruiter(fd);
                  setMessage("Reclutador guardado.");
                  router.refresh();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "No se pudo guardar el reclutador."
                  );
                }
              });
            }}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
              Reclutador {index + 1}
            </p>
            <input type="hidden" name="id" value={r.id} />
            <div className="mb-4 flex items-center gap-4">
              <PersonAvatar name={r.name} photoUrl={r.photoUrl} size={72} />
              <p className="text-xs text-muted">
                Foto guardada en el servidor. Sin foto = iniciales.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Nombre
                <input
                  name="name"
                  defaultValue={r.name}
                  required
                  className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
                />
              </label>
              <label className="block text-xs text-muted">
                Equipo / programa
                <input
                  name="teamName"
                  defaultValue={r.teamName}
                  required
                  className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
                />
              </label>
              <label className="block text-xs text-muted sm:col-span-2">
                Foto (archivo, opcional, máx. {UPLOAD_MAX_MB} MB)
                <input
                  type="file"
                  name="photoFile"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="mt-1 w-full text-sm text-muted file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-white"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
                <input type="checkbox" name="removePhoto" className="rounded" />
                Quitar foto guardada
              </label>
              <label className="block text-xs text-muted sm:col-span-2">
                Descripción
                <textarea
                  name="description"
                  defaultValue={r.description}
                  required
                  rows={4}
                  placeholder="Un punto por línea"
                  className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
                />
              </label>
              <label className="block text-xs text-muted">
                Orden
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={r.sortOrder}
                  className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="btn-primary text-sm"
              >
                Guardar
              </button>
              <AdminDeleteButton
                label={r.name}
                onDelete={deleteRecruiter.bind(null, r.id)}
              />
            </div>
          </form>
        ))}
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await createEmptyRecruiter();
            router.refresh();
          })
        }
        className="btn-secondary inline-flex items-center gap-2 text-sm"
      >
        <Plus size={16} aria-hidden />
        Agregar reclutador
      </button>

      {error && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {message && <p className="text-sm text-green-400">{message}</p>}
    </div>
  );
}
