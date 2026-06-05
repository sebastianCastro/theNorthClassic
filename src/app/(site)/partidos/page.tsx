import { SectionHeading } from "@/components/ui/SectionHeading";
import { getGamesByDivision } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { formatDateTimeMX } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Partidos",
  description:
    "Calendario y resultados de partidos del torneo de basketball juvenil The North Classic en Chihuahua.",
  path: "/partidos",
});

function MatchRow({
  home,
  away,
  homeScore,
  awayScore,
  scheduledAt,
  venue,
  round,
  status,
}: {
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: Date;
  venue: string | null;
  round: string | null;
  status: string;
}) {
  const isFinal =
    homeScore != null && awayScore != null && status !== "SCHEDULED";
  const homeWins = isFinal && homeScore! > awayScore!;
  const awayWins = isFinal && awayScore! > homeScore!;

  return (
    <li className="grid gap-2 border-b border-border p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-xs text-muted">
          {formatDateTimeMX(scheduledAt)}
          {venue ? ` · ${venue}` : ""}
          {round ? ` · ${round}` : ""}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-2 font-medium">
          <span className={cn(isFinal && homeWins && "text-accent font-bold")}>
            {home}
          </span>
          <span className="text-muted">vs</span>
          <span className={cn(isFinal && awayWins && "text-accent font-bold")}>
            {away}
          </span>
        </p>
        {status === "LIVE" && (
          <span className="mt-1 inline-block rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase">
            En vivo
          </span>
        )}
      </div>
      <p className="stat-number text-2xl font-bold text-white sm:text-right">
        {isFinal ? `${homeScore} - ${awayScore}` : "—"}
      </p>
    </li>
  );
}

export default async function PartidosPage() {
  const divisions = await getGamesByDivision();

  return (
    <div className="section-padding">
      <div className="container-north">
        <SectionHeading
          eyebrow="Torneo"
          title="Partidos"
          subtitle="Próximos juegos y resultados por división."
        />

        {divisions.length === 0 ? (
          <p className="text-muted">No hay partidos programados aún.</p>
        ) : (
          divisions.map(({ label, games }) => {
            const upcoming = games.filter(
              (g) => g.homeScore == null || g.awayScore == null,
            );
            const completed = games.filter(
              (g) => g.homeScore != null && g.awayScore != null,
            );

            return (
              <section key={label} className="mb-16">
                <h2 className="heading-display mb-8 text-3xl text-white">
                  {label}
                </h2>

                {upcoming.length > 0 && (
                  <div className="mb-10">
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
                      Próximos partidos
                    </h3>
                    <ul className="rounded-lg border border-border">
                      {upcoming.map((g) => (
                        <MatchRow
                          key={g.id}
                          home={g.homeTeam.name}
                          away={g.awayTeam.name}
                          homeScore={g.homeScore}
                          awayScore={g.awayScore}
                          scheduledAt={g.scheduledAt}
                          venue={g.venue}
                          round={g.round}
                          status={g.status}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {completed.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
                      Partidos completados
                    </h3>
                    <ul className="rounded-lg border border-border">
                      {completed.map((g) => (
                        <MatchRow
                          key={g.id}
                          home={g.homeTeam.name}
                          away={g.awayTeam.name}
                          homeScore={g.homeScore}
                          awayScore={g.awayScore}
                          scheduledAt={g.scheduledAt}
                          venue={g.venue}
                          round={g.round}
                          status={g.status}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {upcoming.length === 0 && completed.length === 0 && (
                  <p className="text-sm text-muted">Sin partidos en esta división.</p>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
