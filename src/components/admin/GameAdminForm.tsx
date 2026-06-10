"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertGame, deleteGame } from "@/app/admin/actions";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { formatDateTimeMX } from "@/lib/utils";
import { ROUND_PRESETS, ROUND_CUSTOM } from "@/lib/game-rounds";
import { isGamePlayed } from "@/lib/game-scores";
import { AdminFormFeedback } from "./AdminFormFeedback";

type Team = {
  id: string;
  name: string;
  genderDivision: string;
  categoryDivision: string;
};

type Game = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: Date;
  venue: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  round: string | null;
  homeTeam: { name: string };
  awayTeam: { name: string };
};

function toDatetimeLocalValue(date: Date): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resolveRoundPreset(round: string | null): {
  preset: string;
  custom: string;
} {
  if (!round) return { preset: "", custom: "" };
  if ((ROUND_PRESETS as readonly string[]).includes(round)) {
    return { preset: round, custom: "" };
  }
  return { preset: ROUND_CUSTOM, custom: round };
}

function GameFields({
  teams,
  game,
  roundPreset,
  onRoundPresetChange,
}: {
  teams: Team[];
  game?: Game;
  roundPreset: string;
  onRoundPresetChange: (value: string) => void;
}) {
  const round = game ? resolveRoundPreset(game.round) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-xs text-muted">
        Local
        <select
          name="homeTeamId"
          required
          defaultValue={game?.homeTeamId}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        >
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
        <select
          name="awayTeamId"
          required
          defaultValue={game?.awayTeamId}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        >
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
        <input
          type="datetime-local"
          name="scheduledAt"
          required
          defaultValue={game ? toDatetimeLocalValue(game.scheduledAt) : undefined}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Sede
        <input
          name="venue"
          defaultValue={
            game?.venue ?? "Gimnasio del Instituto La Salle Chihuahua"
          }
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Ronda
        <select
          name="roundPreset"
          value={roundPreset}
          onChange={(e) => onRoundPresetChange(e.target.value)}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        >
          <option value="">Sin ronda</option>
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
          <input
            name="roundCustom"
            defaultValue={round?.custom}
            className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
          />
        </label>
      )}
      <label className="block text-xs text-muted">
        Marcador local
        <input
          type="number"
          name="homeScore"
          min={0}
          placeholder="—"
          defaultValue={game?.homeScore ?? ""}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Marcador visitante
        <input
          type="number"
          name="awayScore"
          min={0}
          placeholder="—"
          defaultValue={game?.awayScore ?? ""}
          className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
        />
      </label>
    </div>
  );
}

export function GameAdminForm({
  teams,
  games,
}: {
  teams: Team[];
  games: Game[];
}) {
  const [createPending, startCreateTransition] = useTransition();
  const [editPending, startEditTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createRoundPreset, setCreateRoundPreset] = useState<string>(
    ROUND_PRESETS[0],
  );
  const [editRoundPreset, setEditRoundPreset] = useState<string>(
    ROUND_PRESETS[0],
  );
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const router = useRouter();

  const editingGame = games.find((g) => g.id === editingId);

  function openEdit(game: Game) {
    const { preset } = resolveRoundPreset(game.round);
    setEditRoundPreset(preset);
    setEditMessage(null);
    setEditError(null);
    setEditingId(game.id);
  }

  return (
    <div className="space-y-12">
      <form
        action={(fd) =>
          startCreateTransition(async () => {
            setCreateError(null);
            setCreateMessage(null);
            try {
              fd.set("roundPreset", createRoundPreset);
              await upsertGame(fd);
              setCreateMessage("Partido creado.");
              router.refresh();
            } catch (err) {
              setCreateError(
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
        <GameFields
          teams={teams}
          roundPreset={createRoundPreset}
          onRoundPresetChange={setCreateRoundPreset}
        />
        <button type="submit" disabled={createPending} className="btn-primary">
          {createPending ? "Creando…" : "Crear partido"}
        </button>
        <AdminFormFeedback success={createMessage} error={createError} />
      </form>

      <div>
        <h2 className="mb-2 font-semibold text-white">
          Partidos ({games.length})
        </h2>
        <p className="mb-4 text-sm text-muted">
          Usa <span className="text-white">Editar</span> para cambiar equipos,
          fecha, sede, ronda o marcador. Deja los marcadores vacíos si el
          partido aún no se juega.
        </p>
        <ul className="space-y-6">
          {games.map((g) => {
            const played = isGamePlayed(g.homeScore, g.awayScore, g.status);
            const isEditing = editingId === g.id;

            return (
              <li key={g.id} className="rounded-lg border border-border p-4">
                {isEditing && editingGame ? (
                  <form
                    action={(fd) =>
                      startEditTransition(async () => {
                        setEditError(null);
                        setEditMessage(null);
                        try {
                          fd.set("id", g.id);
                          fd.set("roundPreset", editRoundPreset);
                          await upsertGame(fd);
                          setEditMessage("Partido actualizado.");
                          setEditingId(null);
                          router.refresh();
                        } catch (err) {
                          setEditError(
                            err instanceof Error
                              ? err.message
                              : "No se pudo actualizar el partido.",
                          );
                        }
                      })
                    }
                    className="space-y-4"
                  >
                    <h3 className="font-medium text-white">Editar partido</h3>
                    <GameFields
                      teams={teams}
                      game={editingGame}
                      roundPreset={editRoundPreset}
                      onRoundPresetChange={setEditRoundPreset}
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={editPending}
                        className="btn-primary text-sm"
                      >
                        {editPending ? "Guardando…" : "Guardar cambios"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditError(null);
                          setEditMessage(null);
                        }}
                        className="btn-secondary text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                    <AdminFormFeedback success={editMessage} error={editError} />
                  </form>
                ) : (
                  <>
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
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(g)}
                        className="btn-secondary text-xs"
                      >
                        Editar
                      </button>
                      <AdminDeleteButton
                        label="este partido"
                        onDelete={deleteGame.bind(null, g.id)}
                      />
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
