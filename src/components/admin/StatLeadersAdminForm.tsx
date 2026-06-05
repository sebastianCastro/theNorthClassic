"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveStatLeaders } from "@/app/admin/actions";
import { AdminFormFeedback } from "./AdminFormFeedback";
import { SearchablePlayerSelect } from "@/components/admin/SearchablePlayerSelect";
import { playerMatchesDivision } from "@/lib/division-match";
import {
  STAT_LEADER_KEYS,
  divisionLabel,
  type DivisionGroup,
  type StatLeaderSlot,
} from "@/lib/site-config";

type PlayerOption = {
  slug: string;
  label: string;
  categoryDivision: string;
  genderDivision: string;
};

type Props = {
  groups: DivisionGroup[];
  initialSlots: StatLeaderSlot[];
  players: PlayerOption[];
};

function playersForDivision(
  players: PlayerOption[],
  group: DivisionGroup,
  selectedSlugs: string[]
): PlayerOption[] {
  const matched = players
    .filter((p) =>
      playerMatchesDivision(
        {
          category: p.categoryDivision,
          genderDivision: p.genderDivision,
        },
        group.categoryDivision,
        group.genderDivision
      )
    )
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  const extras: PlayerOption[] = [];
  for (const slug of selectedSlugs) {
    if (!slug || matched.some((p) => p.slug === slug)) continue;
    const player = players.find((p) => p.slug === slug);
    if (player) extras.push(player);
  }

  return [...extras, ...matched];
}

export function StatLeadersAdminForm({
  groups,
  initialSlots,
  players,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const slot of initialSlots) {
      if (slot.playerSlug) {
        map[`${slot.categoryDivision}|${slot.genderDivision}|${slot.statKey}`] =
          slot.playerSlug;
      }
    }
    return map;
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPlayers = players.length;

  const handleSave = () => {
    setSuccess(null);
    setError(null);
    startTransition(async () => {
      try {
        const leaders = Object.entries(selections)
          .filter(([, slug]) => slug)
          .map(([key, playerSlug]) => {
            const [categoryDivision, genderDivision, statKey] = key.split("|");
            return {
              categoryDivision,
              genderDivision,
              statKey,
              playerSlug,
            };
          });
        await saveStatLeaders(leaders);
        setSuccess("Líderes guardados.");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudieron guardar los líderes.",
        );
      }
    });
  };

  return (
    <div className="space-y-10">
      {totalPlayers === 0 && (
        <p className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
          No hay jugadores en la base de datos. Importa el CSV de jugadores
          primero y vincula equipos.
        </p>
      )}

      {groups.map((group) => {
        const divLabel = divisionLabel(
          group.categoryDivision,
          group.genderDivision
        );
        const divisionSelectedSlugs = STAT_LEADER_KEYS.map(
          (stat) =>
            selections[
              `${group.categoryDivision}|${group.genderDivision}|${stat.key}`
            ] ?? ""
        );
        const divisionPlayers = playersForDivision(
          players,
          group,
          divisionSelectedSlugs
        );

        return (
          <div
            key={divLabel}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <h2 className="heading-display text-xl text-white">{divLabel}</h2>
            <p className="mt-1 text-xs text-muted">
              {divisionPlayers.length} jugador
              {divisionPlayers.length !== 1 ? "es" : ""} en esta división
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STAT_LEADER_KEYS.map((stat) => {
                const key = `${group.categoryDivision}|${group.genderDivision}|${stat.key}`;
                const slotOptions = playersForDivision(players, group, [
                  selections[key] ?? "",
                ]);
                return (
                  <label key={key} className="block text-xs text-muted">
                    {stat.label}
                    <div className="mt-1">
                      <SearchablePlayerSelect
                        options={slotOptions.map((p) => ({
                          slug: p.slug,
                          label: p.label,
                        }))}
                        value={selections[key] ?? ""}
                        onChange={(slug) =>
                          setSelections((prev) => ({
                            ...prev,
                            [key]: slug,
                          }))
                        }
                        disabled={
                          slotOptions.length === 0 && !selections[key]
                        }
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="btn-primary"
      >
        {pending ? "Guardando…" : "Guardar líderes"}
      </button>
      <AdminFormFeedback success={success} error={error} className="mt-3" />
    </div>
  );
}
