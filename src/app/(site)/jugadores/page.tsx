import { PlayerDirectory } from "@/components/players/PlayerDirectory";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllPlayers, getTeamsList } from "@/lib/data";
import { getSiteConfig, getDivisionGroups } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Directorio de jugadores",
  description:
    "Perfiles de jugadores del showcase de basketball en Chihuahua. Filtros por posición, equipo y categoría para scouting y reclutamiento universitario.",
  path: "/jugadores",
});

export default async function JugadoresPage() {
  const [players, teams, config] = await Promise.all([
    getAllPlayers(),
    getTeamsList(),
    getSiteConfig(),
  ]);
  const divisions = getDivisionGroups(config);

  return (
    <div className="section-padding">
      <div className="container-north">
        <SectionHeading
          eyebrow="Scouting"
          title="Directorio de jugadores"
          subtitle="Busca, filtra y compara prospectos. Perfiles diseñados para coaches universitarios y scouts profesionales."
        />
        <PlayerDirectory
          players={players}
          teams={teams.map((t) => ({ slug: t.slug, name: t.name }))}
          divisions={divisions}
        />
      </div>
    </div>
  );
}
