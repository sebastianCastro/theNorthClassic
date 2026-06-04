"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type MediaItem = {
  id: string;
  slug: string;
  title: string;
  type: string;
  url: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  description: string | null;
};

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "instagram", label: "Instagram" },
  { key: "video", label: "Videos" },
  { key: "noticia", label: "Noticias" },
];

export function MediaFilter({ items }: { items: MediaItem[] }) {
  const [filter, setFilter] = useState("all");
  const list =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
              filter === f.key
                ? "bg-accent text-white"
                : "border border-border text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <article
            key={m.id}
            className="overflow-hidden rounded-lg border border-border bg-surface"
          >
            {m.type === "instagram" && m.embedUrl ? (
              <div className="aspect-square bg-black p-2">
                <iframe
                  src={m.embedUrl}
                  title={m.title}
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-black">
                <Image
                  src={
                    m.thumbnailUrl ??
                    "https://images.unsplash.com/photo-1574623456110-8fd79f591e35?w=800&q=80"
                  }
                  alt={m.title}
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs uppercase text-accent">{m.type}</p>
              <h2 className="mt-1 font-semibold text-white">{m.title}</h2>
              {m.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {m.description}
                </p>
              )}
              {m.type === "video" && m.url && (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent hover:underline"
                >
                  Ver video →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      {list.length === 0 && (
        <p className="py-12 text-center text-muted">No hay contenido en esta categoría.</p>
      )}
    </>
  );
}
