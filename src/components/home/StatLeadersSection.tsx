import Link from "next/link";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { divisionLabel, STAT_LEADER_KEYS } from "@/lib/site-config";
import {
  getSiteConfig,
  buildStatLeaderGrid,
  getDivisionGroupsFromTeams,
} from "@/lib/site-config";
import { getStatLeaderPlayers } from "@/lib/data";

export async function StatLeadersSection() {
  const [config, groups] = await Promise.all([
    getSiteConfig(),
    getDivisionGroupsFromTeams(),
  ]);
  const { bySlug } = await getStatLeaderPlayers();
  const grid = buildStatLeaderGrid(config, groups);

  const byDivision = new Map<string, typeof grid>();
  for (const slot of grid) {
    const key = divisionLabel(slot.categoryDivision, slot.genderDivision);
    if (!byDivision.has(key)) byDivision.set(key, []);
    byDivision.get(key)!.push(slot);
  }

  return (
    <section className="section-padding border-b border-border bg-[#0d0d0d]">
      <div className="container-north">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Estadísticas
        </p>
        <h2 className="heading-display text-4xl text-white md:text-5xl">
          Líderes en estadísticas
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Los mejores del torneo por categoría. ¿Serás el próximo líder?
        </p>

        <div className="mt-8 space-y-10 md:mt-10 md:space-y-12">
          {[...byDivision.entries()].map(([divLabel, slots]) => (
            <div key={divLabel}>
              <h3 className="heading-display mb-6 text-2xl text-white">
                {divLabel}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {slots.map((slot) => {
                  const player = slot.playerSlug
                    ? bySlug.get(slot.playerSlug)
                    : null;
                  const statLabel =
                    STAT_LEADER_KEYS.find((s) => s.key === slot.statKey)
                      ?.label ?? slot.statLabel;

                  const cellClass =
                    "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-3rem)/5)]";

                  if (player) {
                    const name = `${player.firstName} ${player.lastName}`;
                    return (
                      <Link
                        key={`${divLabel}-${slot.statKey}`}
                        href={`/jugadores/${player.slug}`}
                        className={`card-hover block rounded-lg border border-border bg-surface p-3 ${cellClass}`}
                      >
                        <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full">
                          <RemoteImage
                            src={
                              player.photoUrl ??
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9B111E&color=fff`
                            }
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <p className="mt-2 text-center text-xs font-semibold text-accent">
                          {statLabel}
                        </p>
                        <p className="mt-1 text-center text-sm font-medium text-white">
                          {name}
                        </p>
                        <p className="text-center text-xs text-muted">
                          {player.team?.name ?? "—"}
                        </p>
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={`${divLabel}-${slot.statKey}-placeholder`}
                      className={`flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 p-4 text-center ${cellClass}`}
                    >
                      <p className="text-xs font-semibold uppercase text-accent">
                        {statLabel}
                      </p>
                      <p className="mt-3 text-sm font-medium text-white">
                        Este lugar puede ser tuyo
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Próximamente los líderes del torneo
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
