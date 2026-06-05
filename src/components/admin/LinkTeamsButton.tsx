"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminFormFeedback } from "./AdminFormFeedback";

export function LinkTeamsButton({
  action,
}: {
  action: () => Promise<number>;
}) {
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
          setSuccess(null);
          setError(null);
          startTransition(async () => {
            try {
              const n = await action();
              setSuccess(
                n > 0
                  ? `${n} jugador(es) vinculados a equipos.`
                  : "Ningún jugador pendiente de vincular.",
              );
              router.refresh();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "No se pudo vincular.",
              );
            }
          });
        }}
        className="btn-secondary text-xs"
      >
        {pending ? "Vinculando…" : "Vincular rosters"}
      </button>
      <AdminFormFeedback success={success} error={error} />
    </div>
  );
}
