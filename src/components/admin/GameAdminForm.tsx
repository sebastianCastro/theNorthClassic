"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertGame, updateGameScore, deleteGame } from "@/app/admin/actions";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { formatDateTimeMX } from "@/lib/utils";
import { ROUND_PRESETS, ROUND_CUSTOM } from "@/lib/game-rounds";
import { isGamePlayed } from "@/lib/game-scores";

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
  const [createPending, startCreateTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roundPreset, setRoundPreset] = useState<string>(ROUND_PRESETS[0]);
  const router = useRouter();

  return (
    <div className="space-y-12">
      <form
        action={(fd) =>
          startCreateTransition(async () => {
            setError(null);
            setCreateMessage(null);
            try {
              fd.set("roundPreset", roundPreset);
              await upsertGame(fd);
              setCreateMessage("Partido creado.");
              router.refresh();
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "No se pudo crear el partido.",
              );
            }
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
        <button type="submit" disabled={createPending} className="btn-primary">
          {createPending ? "Creando…" : "Crear partido"}
        </button>
        {createMessage && (
          <p className="text-sm text-green-400" role="status">
            {createMessage}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>

      <div>
        <h2 className="mb-2 font-semibold text-white">Partidos ({games.length})</h2>
        <p className="mb-4 text-sm text-muted">
          Deja los marcadores vacíos si el partido aún no se juega. Captura ambos
          cuando termine para marcarlo como jugado.
        </p>
        <ul className="space-y-6">
          {games.map((g) => {
            const played = isGamePlayed(g.homeScore, g.awayScore, g.status);
            const formKey = `${g.id}-${g.homeScore ?? ""}-${g.awayScore ?? ""}-${g.status}`;

            return (
              <li key={g.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">
                      {formatDateTimeMX(g.scheduledAt)}
                      {g.round ? ` · ${g.round}` : ""}
                      {g.venue ? ` · ${g.venue}` : ""}
                    </p>
                    <p className="mt-1 font-medium text-white">
                      {g.homeTeam.name} vs {g.awayTeam.name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      played
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border text-muted"
                    }`}
                  >
                    {played
                      ? `Jugado · ${g.homeScore}-${g.awayScore}`
                      : "Por jugar"}
                  </span>
                </div>
                <form
                  key={formKey}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setError(null);
                    setSavedId(null);
                    const fd = new FormData(e.currentTarget);
                    setSavingId(g.id);
                    void (async () => {
                      try {
                        await updateGameScore(g.id, fd);
                        setSavedId(g.id);
                        router.refresh();
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "No se pudo guardar el marcador.",
                        );
                      } finally {
                        setSavingId(null);
                      }
                    })();
                  }}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <label className="text-xs text-muted">
                    Local
                    <input
                      type="number"
                      name="homeScore"
                      min={0}
                      placeholder="—"
                      defaultValue={g.homeScore ?? ""}
                      className="mt-1 w-20 rounded border border-border bg-black px-3 py-2 text-white"
                    />
                  </label>
                  <label className="text-xs text-muted">
                    Visitante
                    <input
                      type="number"
                      name="awayScore"
                      min={0}
                      placeholder="—"
                      defaultValue={g.awayScore ?? ""}
                      className="mt-1 w-20 rounded border border-border bg-black px-3 py-2 text-white"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={savingId === g.id}
                    className="btn-secondary text-xs"
                  >
                    {savingId === g.id ? "Guardando…" : "Guardar"}
                  </button>
                  {savedId === g.id && (
                    <p className="text-sm text-green-400" role="status">
                      Guardado.
                    </p>
                  )}
                </form>
                <div className="mt-3">
                  <AdminDeleteButton label="este partido" onDelete={deleteGame.bind(null, g.id)} />
                </div>
              </li>
            );
          })}
        </ul>
        {error && !savedId && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
