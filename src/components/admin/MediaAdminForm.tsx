"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createMedia } from "@/app/admin/actions";
import { AdminFormFeedback } from "./AdminFormFeedback";

export function MediaAdminForm() {
  const router = useRouter();
  const [type, setType] = useState("instagram");
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);
        const form = e.currentTarget;
        const fd = new FormData(form);
        startTransition(async () => {
          try {
            await createMedia(fd);
            setSuccess("Contenido publicado.");
            form.reset();
            setType("instagram");
            router.refresh();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "No se pudo publicar.",
            );
          }
        });
      }}
      className="mb-12 space-y-4 rounded-lg border border-border p-6"
    >
      <h2 className="font-semibold text-white">Publicar contenido</h2>
      <label className="block text-xs text-muted">
        Tipo
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        >
          <option value="instagram">Instagram</option>
          <option value="video">Video</option>
          <option value="noticia">Noticia</option>
        </select>
      </label>
      <label className="block text-xs text-muted">
        Título
        <input
          name="title"
          required
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      {type === "instagram" && (
        <label className="block text-xs text-muted">
          URL de embed de Instagram
          <input
            name="embedUrl"
            required
            placeholder="https://www.instagram.com/p/..."
            className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
          />
        </label>
      )}
      {type === "video" && (
        <>
          <label className="block text-xs text-muted">
            URL del video
            <input
              name="url"
              required
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
          <label className="block text-xs text-muted">
            Miniatura (URL)
            <input
              name="thumbnailUrl"
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
        </>
      )}
      {type === "noticia" && (
        <>
          <label className="block text-xs text-muted">
            Imagen de portada (URL)
            <input
              name="thumbnailUrl"
              required
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
          <label className="block text-xs text-muted">
            Descripción
            <textarea
              name="description"
              rows={3}
              required
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
          <input type="hidden" name="url" value="#" />
        </>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Publicando…" : "Publicar"}
        </button>
        <AdminFormFeedback success={success} error={error} />
      </div>
    </form>
  );
}
