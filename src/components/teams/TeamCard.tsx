import Link from "next/link";
import { divisionLabel } from "@/lib/site-config";
import { TeamLogo } from "./TeamLogo";

export type TeamCardData = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  genderDivision: string;
  categoryDivision: string;
  wins: number;
  losses: number;
};

export function TeamCard({ team }: { team: TeamCardData }) {
  const record = `${team.wins}-${team.losses}`;
  const division = divisionLabel(team.categoryDivision, team.genderDivision);

  return (
    <Link
      href={`/equipos/${team.slug}`}
      className="card-hover flex flex-col items-center rounded-lg border border-border bg-surface-elevated p-8 text-center"
    >
      <TeamLogo name={team.name} logoUrl={team.logoUrl} size={96} />
      <h3 className="heading-display mt-4 text-2xl text-white">{team.name}</h3>
      <p className="mt-1 text-sm text-accent">{division}</p>
      <p className="stat-number mt-3 text-lg text-muted">{record}</p>
    </Link>
  );
}
