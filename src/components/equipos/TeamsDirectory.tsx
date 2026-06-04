"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamCard, type TeamCardData } from "@/components/teams/TeamCard";

export function TeamsDirectory({
  teams,
  genderDivisions,
  categoryDivisions,
  femenilCategoryDivision,
}: {
  teams: TeamCardData[];
  genderDivisions: string[];
  categoryDivisions: string[];
  femenilCategoryDivision: string;
}) {
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");

  const categoryOptions = useMemo(() => {
    if (gender === "Femenil") return [femenilCategoryDivision];
    return categoryDivisions;
  }, [gender, categoryDivisions, femenilCategoryDivision]);

  useEffect(() => {
    if (
      gender === "Femenil" &&
      category &&
      category !== femenilCategoryDivision
    ) {
      setCategory("");
    }
  }, [gender, category, femenilCategoryDivision]);

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      if (gender && t.genderDivision !== gender) return false;
      if (category && t.categoryDivision !== category) return false;
      return true;
    });
  }, [teams, gender, category]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="rounded border border-border bg-black px-3 py-2 text-sm text-white"
          aria-label="Filtrar por género"
        >
          <option value="">Todos los géneros</option>
          {genderDivisions.map((g) => (
            <option key={g} value={g}>
              {g}
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
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <TeamCard key={t.slug} team={t} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted">No hay equipos en este filtro.</p>
      )}
    </div>
  );
}
