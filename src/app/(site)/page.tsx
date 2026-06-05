import Link from "next/link";
import { SponsorsSection } from "@/components/sponsors/SponsorsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { TeamCard } from "@/components/teams/TeamCard";
import { StatLeadersSection } from "@/components/home/StatLeadersSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { getFeaturedTeams, getSiteStats, getSponsorsForHome } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [teams, stats, sponsors] = await Promise.all([
    getFeaturedTeams(),
    getSiteStats(),
    getSponsorsForHome(),
  ]);

  return (
    <>
      <HeroSection />

      <StatLeadersSection />

      <section className="section-padding border-b border-border bg-[#0d0d0d]">
        <div className="container-north">
          <SectionHeading
            eyebrow="Números"
            title="Cifras del torneo"
            align="center"
          />
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <StatCounter value={stats.players} label="Jugadores" suffix="+" />
            <StatCounter value={stats.teams} label="Equipos" />
            <StatCounter value={stats.games} label="Partidos" suffix="+" />
            <StatCounter
              value={stats.scholarships}
              label="Becas obtenidas"
              placeholder="?"
            />
          </div>
        </div>
      </section>

      <section className="section-padding border-b border-border bg-surface">
        <div className="container-north">
          <SectionHeading
            eyebrow="Equipos"
            title="Mejores equipos"
            subtitle="Conoce a los equipos que compiten en The North Classic."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((t, index) => (
              <div
                key={t.slug}
                className={index >= 4 ? "hidden lg:block" : undefined}
              >
                <TeamCard team={t} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/equipos" className="btn-secondary">
              Ver todos los equipos
            </Link>
          </div>
        </div>
      </section>

      <SponsorsSection
        sponsors={sponsors}
        id="patrocinadores"
        className="section-padding border-b border-border"
      />

      <section className="section-padding">
        <div className="container-north text-center">
          <SectionHeading
            eyebrow="Media"
            title="Síguenos en redes"
            subtitle="Highlights y cobertura con Tiago Shoots y The North Classic."
            align="center"
          />
          <Link href="/media" className="btn-primary mt-8 inline-flex">
            Ir al Media Center
          </Link>
        </div>
      </section>
    </>
  );
}
