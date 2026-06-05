"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveScholarshipsCount } from "@/app/admin/actions";
import { AdminFormFeedback } from "./AdminFormFeedback";

export function ScholarshipsAdminForm({
  initialCount,
}: {
  initialCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);
        const fd = new FormData(e.currentTarget);
        const n = parseInt(String(fd.get("scholarships")), 10);
        startTransition(async () => {
          try {
            await saveScholarshipsCount(Number.isFinite(n) ? n : 0);
            setSuccess("Becas guardadas.");
            router.refresh();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "No se pudo guardar.",
            );
          }
        });
      }}
      className="mt-8 max-w-md rounded-lg border border-border bg-surface p-6"
    >
      <h2 className="font-semibold text-white">Becas en inicio</h2>
      <p className="mt-1 text-sm text-muted">
        Estadística &ldquo;La liga en cifras&rdquo;. Deja en 0 para mostrar signo
        de interrogación.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block flex-1 text-xs text-muted">
          Becas obtenidas
          <input
            name="scholarships"
            type="number"
            min={0}
            defaultValue={initialCount}
            className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="btn-secondary shrink-0 text-sm"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      <AdminFormFeedback success={success} error={error} className="mt-3" />
    </form>
  );
}
