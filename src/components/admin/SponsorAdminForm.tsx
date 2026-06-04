"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import {
  upsertSponsor,
  deleteSponsor,
  saveSponsorDisplaySlots,
  createEmptySponsor,
} from "@/app/admin/actions";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { Plus } from "lucide-react";
import { UPLOAD_MAX_MB } from "@/lib/upload-limits";
import { getUploadValidationError } from "./submitWithUploadCheck";

type Sponsor = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  sortOrder: number;
};

export function SponsorAdminForm({
  sponsors,
  displaySlots,
}: {
  sponsors: Sponsor[];
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
        <h2 className="font-semibold text-white">Espacios en inicio</h2>
        <p className="mt-1 text-sm text-muted">
          Cuántos logos mostrar en la página de inicio (máx. 30).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="block text-xs text-muted">
            Espacios a mostrar
            <input
              type="number"
              min={1}
              max={30}
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
                await saveSponsorDisplaySlots(slots);
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
          Registrados: {sponsors.length} · Mostrando en inicio:{" "}
          {Math.min(sponsors.length, slots)}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-white">
          Patrocinadores ({sponsors.length})
        </h2>
        {sponsors.map((s, index) => (
          <form
            key={s.id}
            encType="multipart/form-data"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              setMessage(null);
              const fd = new FormData(e.currentTarget);
              fd.set("id", s.id);
              const uploadError = getUploadValidationError(fd, "logoFile");
              if (uploadError) {
                setError(uploadError);
                return;
              }
              startTransition(async () => {
                try {
                  await upsertSponsor(fd);
                  setMessage("Patrocinador guardado.");
                  router.refresh();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "No se pudo guardar el patrocinador."
                  );
                }
              });
            }}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
              Patrocinador {index + 1}
            </p>
            <input type="hidden" name="id" value={s.id} />
            <div className="mb-4 flex items-center gap-4">
              <SponsorLogo name={s.name} logoUrl={s.logoUrl} height={48} />
              <p className="text-xs text-muted">
                Sin logo se muestran iniciales en el sitio público.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Nombre
                <input
                  name="name"
                  defaultValue={s.name}
                  required
                  className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
                />
              </label>
              <label className="block text-xs text-muted">
                Enlace al sitio
                <input
                  name="websiteUrl"
                  defaultValue={s.websiteUrl ?? ""}
                  type="url"
                  className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
                />
              </label>
              <label className="block text-xs text-muted sm:col-span-2">
                Logo (archivo local, opcional, máx. {UPLOAD_MAX_MB} MB)
                <input
                  type="file"
                  name="logoFile"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="mt-1 w-full text-sm text-muted file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-white"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
                <input type="checkbox" name="removeLogo" className="rounded" />
                Quitar logo guardado
              </label>
              <label className="block text-xs text-muted">
                Orden (menor = primero)
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={s.sortOrder}
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
                label={s.name}
                onDelete={deleteSponsor.bind(null, s.id)}
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
            await createEmptySponsor();
            router.refresh();
          })
        }
        className="btn-secondary inline-flex items-center gap-2 text-sm"
      >
        <Plus size={16} aria-hidden />
        Agregar patrocinador
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
