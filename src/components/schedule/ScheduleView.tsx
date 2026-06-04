"use client";

import { useMemo, useState } from "react";
import { formatDateTimeMX } from "@/lib/utils";

type Game = {
  id: string;
  scheduledAt: string;
  venue: string | null;
  category: string | null;
  status: string;
  round: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
};

export function ScheduleView({
  games,
  categories,
}: {
  games: Game[];
  categories: Record<string, string>;
}) {
  const [category, setCategory] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");

  const filtered = useMemo(() => {
    let list = [...games];
    if (category) list = list.filter((g) => g.category === category);
    return list.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, [games, category]);

  const byDate = useMemo(() => {
    const map = new Map<string, Game[]>();
    filtered.forEach((g) => {
      const key = new Date(g.scheduledAt).toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    });
    return map;
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-border bg-black px-3 py-2 text-sm text-white"
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(categories).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <div className="flex gap-2" role="group" aria-label="Tipo de vista">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded px-4 py-2 text-sm ${view === "list" ? "bg-accent text-white" : "border border-border text-muted"}`}
            aria-pressed={view === "list"}
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded px-4 py-2 text-sm ${view === "calendar" ? "bg-accent text-white" : "border border-border text-muted"}`}
            aria-pressed={view === "calendar"}
          >
            Por día
          </button>
        </div>
      </div>

      {view === "list" ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {filtered.map((g) => (
            <li key={g.id} className="p-4 md:flex md:items-center md:justify-between md:gap-4">
              <div>
                <p className="text-xs text-muted">
                  {formatDateTimeMX(g.scheduledAt)}
                  {g.venue && ` · ${g.venue}`}
                </p>
                <p className="mt-1 font-medium text-white">
                  {g.homeTeam} vs {g.awayTeam}
                </p>
                {g.round && (
                  <p className="text-xs text-accent">{g.round}</p>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 md:mt-0">
                {g.status === "LIVE" && (
                  <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase text-white">
                    En vivo
                  </span>
                )}
                <span className="stat-number text-xl text-white">
                  {g.homeScore != null
                    ? `${g.homeScore} - ${g.awayScore}`
                    : "—"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-10">
          {[...byDate.entries()].map(([date, dayGames]) => (
            <section key={date}>
              <h3 className="heading-display mb-4 text-2xl capitalize text-white">
                {date}
              </h3>
              <ul className="space-y-3">
                {dayGames.map((g) => (
                  <li
                    key={g.id}
                    className="rounded border border-border bg-surface p-4"
                  >
                    <p className="text-sm text-muted">
                      {formatDateTimeMX(g.scheduledAt)}
                    </p>
                    <p className="font-medium text-white">
                      {g.homeTeam} vs {g.awayTeam}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted">No hay partidos programados.</p>
      )}
    </div>
  );
}
