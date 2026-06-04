"use client";

import { useState } from "react";
import { createMedia } from "@/app/admin/actions";

export function MediaAdminForm() {
  const [type, setType] = useState("instagram");

  return (
    <form action={createMedia} className="mb-12 space-y-4 rounded-lg border border-border p-6">
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
        <input name="title" required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
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
            <input name="url" required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
          </label>
          <label className="block text-xs text-muted">
            Miniatura (URL)
            <input name="thumbnailUrl" className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
          </label>
        </>
      )}
      {type === "noticia" && (
        <>
          <label className="block text-xs text-muted">
            Imagen de portada (URL)
            <input name="thumbnailUrl" required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
          </label>
          <label className="block text-xs text-muted">
            Descripción
            <textarea name="description" rows={3} required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
          </label>
          <input type="hidden" name="url" value="#" />
        </>
      )}
      <button type="submit" className="btn-primary">
        Publicar
      </button>
    </form>
  );
}
