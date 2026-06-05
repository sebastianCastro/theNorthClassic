"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateTeam } from "@/app/admin/actions";
import { AdminFormFeedback } from "./AdminFormFeedback";

type Team = {
  id: string;
  name: string;
  logoUrl: string | null;
  genderDivision: string;
  categoryDivision: string;
  coaches: string | null;
  description: string | null;
};

export function TeamAdminForm({ team }: { team: Team }) {
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
        startTransition(async () => {
          try {
            await updateTeam(team.id, fd);
            setSuccess("Equipo guardado.");
            router.refresh();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "No se pudo guardar el equipo.",
            );
          }
        });
      }}
      className="mt-8 space-y-4 rounded-lg border border-border p-6"
    >
      <label className="block text-xs text-muted">
        Nombre
        <input
          name="name"
          defaultValue={team.name}
          required
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        URL del logo
        <input
          name="logoUrl"
          defaultValue={team.logoUrl ?? ""}
          type="url"
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Género
        <select
          name="genderDivision"
          defaultValue={team.genderDivision}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        >
          <option value="Varonil">Varonil</option>
          <option value="Femenil">Femenil</option>
        </select>
      </label>
      <label className="block text-xs text-muted">
        Categoría
        <input
          name="categoryDivision"
          defaultValue={team.categoryDivision}
          required
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Entrenadores
        <input
          name="coaches"
          defaultValue={team.coaches ?? ""}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Descripción
        <textarea
          name="description"
          defaultValue={team.description ?? ""}
          rows={3}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        <AdminFormFeedback success={success} error={error} />
      </div>
    </form>
  );
}
