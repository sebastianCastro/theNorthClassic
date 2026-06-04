"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminDeleteButtonProps = {
  label: string;
  onDelete: () => Promise<void>;
};

export function AdminDeleteButton({ label, onDelete }: AdminDeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`¿Eliminar ${label}?`)) return;
        startTransition(async () => {
          await onDelete();
          router.refresh();
        });
      }}
      className="text-xs uppercase tracking-wider text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "…" : "Eliminar"}
    </button>
  );
}
