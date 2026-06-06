"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  upsertSponsor,
  deleteSponsor,
  saveSponsorDisplaySlots,
  createEmptySponsor,
} from "@/app/admin/actions";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { AdminFormFeedback } from "./AdminFormFeedback";
import { Plus } from "lucide-react";
import { UPLOAD_MAX_MB, isLocalUpload } from "@/lib/upload-limits";
import { getUploadValidationError } from "./submitWithUploadCheck";

type Sponsor = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  sortOrder: number;
};

type Feedback = {
  key: string;
  success?: string;
  error?: string;
};

export function SponsorAdminForm({
  sponsors,
  displaySlots,
}: {
  sponsors: Sponsor[];
  displaySlots: number;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState(displaySlots);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function runAction(
    key: string,
    action: () => Promise<void>,
    successMessage: string,
  ) {
    setBusyKey(key);
    setFeedback(null);
    try {
      await action();
      setFeedback({ key, success: successMessage });
      router.refresh();
    } catch (err) {
      setFeedback({
        key,
        error:
          err instanceof Error ? err.message : "No se pudo guardar el patrocinador.",
      });
    } finally {
      setBusyKey(null);
    }
  }

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
            disabled={busyKey === "slots"}
            onClick={() =>
              runAction(
                "slots",
                async () => {
                  await saveSponsorDisplaySlots(slots);
                },
                "Espacios actualizados.",
              )
            }
            className="btn-secondary text-sm"
          >
            {busyKey === "slots" ? "Guardando…" : "Guardar espacios"}
          </button>
          <AdminFormFeedback
            success={feedback?.key === "slots" ? feedback.success : null}
            error={feedback?.key === "slots" ? feedback.error : null}
          />
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
        {sponsors.map((s, index) => {
          const itemKey = `sponsor-${s.id}`;
          return (
            <form
              key={s.id}
              encType="multipart/form-data"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                fd.set("id", s.id);
                const uploadError = getUploadValidationError(fd, "logoFile");
                if (uploadError) {
                  setFeedback({ key: itemKey, error: uploadError });
                  return;
                }
                void runAction(
                  itemKey,
                  async () => {
                    await upsertSponsor(fd);
                  },
                  "Patrocinador guardado.",
                );
              }}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
                Patrocinador {index + 1}
              </p>
              <input type="hidden" name="id" value={s.id} />
              <input
                type="hidden"
                name="existingPhotoUrl"
                value={s.logoUrl ?? ""}
              />
              <div className="mb-4 flex items-center gap-4">
                <SponsorLogo name={s.name} logoUrl={s.logoUrl} height={48} />
                <p className="text-xs text-muted">
                  Enlace externo o archivo local (máx. {UPLOAD_MAX_MB} MB). El
                  archivo tiene prioridad si eliges ambos. Sin logo se muestran
                  iniciales en el sitio público.
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
                  Enlace del logo (opcional)
                  <input
                    name="logoUrl"
                    defaultValue={
                      s.logoUrl && !isLocalUpload(s.logoUrl) ? s.logoUrl : ""
                    }
                    type="url"
                    placeholder="https://..."
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
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={busyKey === itemKey}
                  className="btn-primary text-sm"
                >
                  {busyKey === itemKey ? "Guardando…" : "Guardar"}
                </button>
                <AdminDeleteButton
                  label={s.name}
                  onDelete={deleteSponsor.bind(null, s.id)}
                />
                <AdminFormFeedback
                  success={feedback?.key === itemKey ? feedback.success : null}
                  error={feedback?.key === itemKey ? feedback.error : null}
                />
              </div>
            </form>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busyKey === "add"}
          onClick={() =>
            runAction(
              "add",
              async () => {
                await createEmptySponsor();
              },
              "Patrocinador agregado.",
            )
          }
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} aria-hidden />
          {busyKey === "add" ? "Agregando…" : "Agregar patrocinador"}
        </button>
        <AdminFormFeedback
          success={feedback?.key === "add" ? feedback.success : null}
          error={feedback?.key === "add" ? feedback.error : null}
        />
      </div>
    </div>
  );
}
