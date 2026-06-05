export function parseScoreField(
  raw: FormDataEntryValue | null,
): number | null {
  if (raw === null || raw === "") return null;
  const value = parseInt(String(raw), 10);
  return Number.isNaN(value) ? null : value;
}

export function resolveGameStatusFromScores(
  homeScore: number | null,
  awayScore: number | null,
): "SCHEDULED" | "FINAL" {
  if (homeScore != null && awayScore != null) return "FINAL";
  return "SCHEDULED";
}

export function isGamePlayed(
  homeScore: number | null,
  awayScore: number | null,
  status: string,
): boolean {
  return (
    status === "FINAL" && homeScore != null && awayScore != null
  );
}
