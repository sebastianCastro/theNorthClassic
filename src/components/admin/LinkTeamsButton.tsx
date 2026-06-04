"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function LinkTeamsButton({
  action,
}: {
  action: () => Promise<number>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const n = await action();
          alert(
            n > 0
              ? `${n} jugador(es) vinculados a equipos`
              : "Ningún jugador pendiente de vincular (importa jugadores con columna equipo primero)"
          );
          router.refresh();
        })
      }
      className="btn-secondary text-xs"
    >
      {pending ? "…" : "Vincular rosters"}
    </button>
  );
}
