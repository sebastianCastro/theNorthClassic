"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertGame, updateGameScore, deleteGame } from "@/app/admin/actions";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { formatDateTimeMX } from "@/lib/utils";
import { ROUND_PRESETS, ROUND_CUSTOM } from "@/lib/game-rounds";

type Team = { id: string; name: string; genderDivision: string; categoryDivision: string };

type Game = {
  id: string;
  scheduledAt: Date;
  venue: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  round: string | null;
  homeTeam: { name: string };
  awayTeam: { name: string };
};

export function GameAdminForm({ teams, games }: { teams: Team[]; games: Game[] }) {
  const [pending, startTransition] = useTransition();
  const [roundPreset, setRoundPreset] = useState<string>(ROUND_PRESETS[0]);
  const router = useRouter();

  return (
    <div className="space-y-12">
      <form
        action={(fd) =>
          startTransition(async () => {
            fd.set("roundPreset", roundPreset);
            await upsertGame(fd);
            router.refresh();
          })
        }
        className="space-y-4 rounded-lg border border-border p-6"
      >
        <h2 className="font-semibold text-white">Agregar partido</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-muted">
            Local
            <select name="homeTeamId" required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white">
              <option value="">Seleccionar…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.categoryDivision} {t.genderDivision})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Visitante
            <select name="awayTeamId" required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white">
              <option value="">Seleccionar…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.categoryDivision} {t.genderDivision})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Fecha y hora
            <input type="datetime-local" name="scheduledAt" required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
          </label>
          <label className="block text-xs text-muted">
            Sede
            <input
              name="venue"
              defaultValue="Gimnasio del Instituto La Salle Chihuahua"
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
          <label className="block text-xs text-muted">
            Ronda
            <select
              value={roundPreset}
              onChange={(e) => setRoundPreset(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            >
              {[...ROUND_PRESETS, ROUND_CUSTOM].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          {roundPreset === ROUND_CUSTOM && (
            <label className="block text-xs text-muted">
              Ronda personalizada
              <input name="roundCustom" className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
            </label>
          )}
        </div>
        <button type="submit" disabled={pending} className="btn-primary">
          Crear partido
        </button>
      </form>

      <div>
        <h2 className="mb-4 font-semibold text-white">Partidos ({games.length})</h2>
        <ul className="space-y-6">
          {games.map((g) => (
            <li key={g.id} className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted">
                {formatDateTimeMX(g.scheduledAt)}
                {g.round ? ` · ${g.round}` : ""}
              </p>
              <p className="mt-1 font-medium text-white">
                {g.homeTeam.name} vs {g.awayTeam.name}
              </p>
              <form
                action={(fd) =>
                  startTransition(async () => {
                    await updateGameScore(g.id, fd);
                    router.refresh();
                  })
                }
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <label className="text-xs text-muted">
                  Local
                  <input type="number" name="homeScore" defaultValue={g.homeScore ?? ""} className="mt-1 w-20 rounded border border-border bg-black px-3 py-2 text-white" />
                </label>
                <label className="text-xs text-muted">
                  Visitante
                  <input type="number" name="awayScore" defaultValue={g.awayScore ?? ""} className="mt-1 w-20 rounded border border-border bg-black px-3 py-2 text-white" />
                </label>
                <label className="text-xs text-muted">
                  Estado
                  <select name="status" defaultValue={g.status} className="mt-1 rounded border border-border bg-black px-3 py-2 text-white">
                    <option value="SCHEDULED">Programado</option>
                    <option value="LIVE">En vivo</option>
                    <option value="FINAL">Final</option>
                  </select>
                </label>
                <button type="submit" disabled={pending} className="btn-secondary text-xs">
                  Guardar
                </button>
              </form>
              <div className="mt-3">
                <AdminDeleteButton label="este partido" onDelete={deleteGame.bind(null, g.id)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
