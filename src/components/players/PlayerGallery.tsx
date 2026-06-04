"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";

type Photo = { url: string; caption?: string | null };

export function PlayerGallery({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.url + i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square overflow-hidden rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? `Foto ${i + 1}`}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="25vw"
            />
          </button>
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          images={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
