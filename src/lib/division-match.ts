import { normalizeGenderDivision } from "@/lib/csv-import";

export function normalizeCategoryDivision(raw: string): string {
  return raw.trim().toLowerCase();
}

export function playerMatchesDivision(
  player: { category?: string | null; genderDivision?: string | null },
  categoryDivision: string,
  genderDivision: string
): boolean {
  const cat = normalizeCategoryDivision(player.category ?? "");
  const gen = normalizeGenderDivision(player.genderDivision ?? "");
  if (!cat || !gen) return false;
  return (
    cat === normalizeCategoryDivision(categoryDivision) &&
    gen === normalizeGenderDivision(genderDivision)
  );
}
