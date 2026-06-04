import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayerCard } from "@/components/players/PlayerCard";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { getTeamBySlug, mapPlayerCard } from "@/lib/data";
import { divisionLabel } from "@/lib/site-config";
import { getTeamRecord } from "@/lib/team-stats";
import { buildMetadata } from "@/lib/seo";
import { formatDateTimeMX } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) return {};
  return buildMetadata({
    title: team.name,
    description: `Roster, récord y partidos de ${team.name} en el torneo de basketball juvenil The North Classic, Chihuahua.`,
    path: `/equipos/${slug}`,
  });
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const record = await getTeamRecord(team.id);
  const roster = team.players.map((p) =>
    mapPlayerCard({ ...p, team: { name: team.name } })
  );

  return (
    <div>
      <section className="border-b border-border bg-surface py-12">
        <div className="container-north">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <TeamLogo name={team.name} logoUrl={team.logoUrl} size={128} />
            <div className="text-center md:text-left">
              <h1 className="heading-display text-5xl text-white md:text-6xl">
                {team.name}
              </h1>
              <p className="mt-2 text-accent">
                {divisionLabel(team.categoryDivision, team.genderDivision)}
              </p>
              <p className="stat-number mt-4 text-2xl text-white">
                {record.wins}-{record.losses}
              </p>
              {team.coaches && (
                <p className="mt-4 text-muted">
                  <span className="text-white">Entrenadores:</span> {team.coaches}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-b border-border">
        <div className="container-north">
          <h2 className="heading-display mb-8 text-4xl text-white">Roster</h2>
          {roster.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {roster.map((p) => (
                <PlayerCard key={p.slug} player={p} />
              ))}
            </div>
          ) : (
            <p className="text-muted">Sin jugadores en el roster aún.</p>
          )}
        </div>
      </section>

      {team.homeGames.length > 0 && (
        <section className="section-padding">
          <div className="container-north">
            <h2 className="heading-display mb-8 text-4xl text-white">
              Partidos recientes
            </h2>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {team.homeGames.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                >
                  <span className="text-sm text-muted">
                    {formatDateTimeMX(g.scheduledAt)}
                  </span>
                  <span className="font-medium text-white">
                    {g.homeTeam.name} vs {g.awayTeam.name}
                  </span>
                  <span className="stat-number text-lg">
                    {g.homeScore != null
                      ? `${g.homeScore} - ${g.awayScore}`
                      : "Por jugar"}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/partidos" className="btn-secondary mt-8 inline-flex">
              Ver todos los partidos
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
