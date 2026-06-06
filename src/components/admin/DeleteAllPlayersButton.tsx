"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAllPlayers } from "@/app/admin/actions";
import { AdminFormFeedback } from "./AdminFormFeedback";

export function DeleteAllPlayersButton({ count }: { count: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (count === 0) return null;

  const resetForm = () => {
    setPassword("");
    setAcknowledged(false);
    setOpen(false);
  };

  return (
    <section className="mt-12 rounded-lg border border-red-900/50 bg-red-950/20 p-6">
      <h2 className="font-semibold text-red-300">Zona de peligro</h2>
      <p className="mt-2 text-sm text-muted">
        Elimina los {count} jugadores registrados para volver a importar desde
        CSV. Requiere una contraseña de confirmación distinta a la de acceso al
        panel.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setError(null);
            setOpen(true);
          }}
          className="mt-4 rounded border border-red-800 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
        >
          Eliminar todos los jugadores…
        </button>
      ) : (
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSuccess(null);
            setError(null);
            startTransition(async () => {
              try {
                const deleted = await deleteAllPlayers(password);
                setSuccess(
                  deleted > 0
                    ? `${deleted} jugador(es) eliminados. Ya puedes importar de nuevo.`
                    : "No había jugadores por eliminar.",
                );
                resetForm();
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "No se pudieron eliminar los jugadores.",
                );
              }
            });
          }}
        >
          <label className="block text-xs text-muted">
            Contraseña de confirmación
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="off"
              className="mt-1 w-full max-w-md rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded"
            />
            <span>
              Entiendo que se borrarán todos los jugadores y que deberé
              importarlos de nuevo desde CSV.
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending || !acknowledged || !password}
              className="rounded bg-red-800 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Eliminando…" : "Confirmar eliminación total"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={resetForm}
              className="btn-secondary text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <AdminFormFeedback success={success} error={error} className="mt-4" />
    </section>
  );
}
