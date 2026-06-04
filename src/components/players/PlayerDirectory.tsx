"use client";

import { useMemo, useState } from "react";
import { Grid, List, Search } from "lucide-react";
import { POSITION_LABELS } from "@/lib/constants";
import { playerMatchesDivision } from "@/lib/division-match";
import { divisionLabel } from "@/lib/site-config";
import { PlayerCard, type PlayerCardData } from "./PlayerCard";
import { formatHeight } from "@/lib/utils";
import Link from "next/link";

type DivisionOption = { categoryDivision: string; genderDivision: string };

type PlayerDirectoryProps = {
  players: (PlayerCardData & {
    category?: string | null;
    genderDivision?: string | null;
  })[];
  teams: { slug: string; name: string }[];
  divisions?: DivisionOption[];
};

export function PlayerDirectory({
  players,
  teams,
  divisions = [],
}: PlayerDirectoryProps) {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("");
  const [team, setTeam] = useState("");
  const [minHeight, setMinHeight] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    let list = [...players];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.teamName?.toLowerCase().includes(q)
      );
    }
    if (position) list = list.filter((p) => p.position === position);
    if (category) {
      const [cat, gen] = category.split("|");
      if (cat && gen) {
        list = list.filter((p) => playerMatchesDivision(p, cat, gen));
      }
    }
    if (team) list = list.filter((p) => p.teamName === team);
    if (minHeight) {
      const h = parseInt(minHeight, 10);
      list = list.filter((p) => (p.heightCm ?? 0) >= h);
    }

    list.sort((a, b) => {
      if (sort === "height") return (b.heightCm ?? 0) - (a.heightCm ?? 0);
      if (sort === "number")
        return (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99);
      return `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
        "es"
      );
    });

    return list;
  }, [players, search, position, category, team, minHeight, sort]);

  return (
    <div>
      <div className="mb-8 rounded-lg border border-border bg-surface p-4 md:p-6">
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={18}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Buscar jugador o equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-border bg-black py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted"
            aria-label="Buscar jugadores"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="rounded border border-border bg-black px-3 py-2 text-sm text-white"
            aria-label="Filtrar por posición"
          >
            <option value="">Todas las posiciones</option>
            {Object.entries(POSITION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded border border-border bg-black px-3 py-2 text-sm text-white"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {divisions.map((d) => {
              const value = `${d.categoryDivision}|${d.genderDivision}`;
              return (
                <option key={value} value={value}>
                  {divisionLabel(d.categoryDivision, d.genderDivision)}
                </option>
              );
            })}
          </select>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="rounded border border-border bg-black px-3 py-2 text-sm text-white"
            aria-label="Filtrar por equipo"
          >
            <option value="">Todos los equipos</option>
            {teams.map((t) => (
              <option key={t.slug} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Altura mín. (cm)"
            value={minHeight}
            onChange={(e) => setMinHeight(e.target.value)}
            className="rounded border border-border bg-black px-3 py-2 text-sm text-white placeholder:text-muted"
            aria-label="Altura mínima en centímetros"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded border border-border bg-black px-3 py-2 text-sm text-white"
            aria-label="Ordenar resultados"
          >
            <option value="name">Nombre A-Z</option>
            <option value="height">Mayor altura</option>
            <option value="number">Número de jersey</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            {filtered.length} jugador{filtered.length !== 1 ? "es" : ""} encontrado
            {filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2" role="group" aria-label="Vista">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded p-2 ${view === "grid" ? "bg-accent text-white" : "text-muted"}`}
              aria-pressed={view === "grid"}
              aria-label="Vista en tarjetas"
            >
              <Grid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded p-2 ${view === "list" ? "bg-accent text-white" : "text-muted"}`}
              aria-pressed={view === "list"}
              aria-label="Vista en lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <PlayerCard key={p.slug} player={p} />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {filtered.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/jugadores/${p.slug}`}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-elevated"
              >
                <span className="stat-number w-10 text-lg text-muted">
                  #{p.jerseyNumber ?? "—"}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-sm text-muted">
                    {p.teamName} ·{" "}
                    {p.position ? POSITION_LABELS[p.position] : "—"} ·{" "}
                    {formatHeight(p.heightCm)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {filtered.length === 0 && (
        <p className="py-16 text-center text-muted">
          No hay jugadores que coincidan con tu búsqueda.
        </p>
      )}
    </div>
  );
}
