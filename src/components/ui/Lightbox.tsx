"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { RemoteImage } from "@/components/ui/RemoteImage";

type LightboxProps = {
  images: { url: string; caption?: string | null }[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: LightboxProps) {
  const current = images[index];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft")
        onNavigate((index - 1 + images.length) % images.length);
    },
    [index, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded p-2 text-white hover:bg-white/10"
        aria-label="Cerrar galería"
      >
        <X size={28} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              onNavigate((index - 1 + images.length) % images.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded p-2 text-white hover:bg-white/10"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate((index + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-2 text-white hover:bg-white/10"
            aria-label="Foto siguiente"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="relative max-h-[80vh] w-full max-w-4xl">
        <RemoteImage
          src={current.url}
          alt={current.caption ?? "Foto del jugador"}
          width={1200}
          height={1600}
          className="mx-auto max-h-[80vh] w-auto object-contain"
        />
        {current.caption && (
          <p className="mt-4 text-center text-sm text-muted">{current.caption}</p>
        )}
      </div>
    </div>
  );
}
