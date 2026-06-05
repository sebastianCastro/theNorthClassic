"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminFormFeedback } from "./AdminFormFeedback";

type AdminDeleteButtonProps = {
  label: string;
  onDelete: () => Promise<void>;
};

export function AdminDeleteButton({ label, onDelete }: AdminDeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`¿Eliminar ${label}?`)) return;
          setSuccess(null);
          setError(null);
          startTransition(async () => {
            try {
              await onDelete();
              setSuccess("Eliminado.");
              router.refresh();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "No se pudo eliminar.",
              );
            }
          });
        }}
        className="text-xs uppercase tracking-wider text-red-400 hover:text-red-300 disabled:opacity-50"
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      <AdminFormFeedback success={success} error={error} />
    </div>
  );
}
