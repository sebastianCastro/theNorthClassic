import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamsDirectory } from "@/components/equipos/TeamsDirectory";
import { getTeams } from "@/lib/data";
import { getFemenilCategoryDivision, getSiteConfig } from "@/lib/site-config";
import { getTeamRecordsMap } from "@/lib/team-stats";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Equipos",
  description:
    "Equipos del torneo de basketball juvenil The North Classic en Chihuahua, por división y categoría.",
  path: "/equipos",
});

export default async function EquiposPage() {
  const [teams, config] = await Promise.all([getTeams(), getSiteConfig()]);
  const records = await getTeamRecordsMap(teams.map((t) => t.id));
  const cards = teams.map((t) => {
    const r = records.get(t.id)!;
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      logoUrl: t.logoUrl,
      genderDivision: t.genderDivision,
      categoryDivision: t.categoryDivision,
      wins: r.wins,
      losses: r.losses,
    };
  });

  return (
    <div className="section-padding">
      <div className="container-north">
        <SectionHeading
          eyebrow="Scouting"
          title="Equipos"
          subtitle="Conoce a los equipos que compiten en The North Classic."
        />
        <TeamsDirectory
          teams={cards}
          genderDivisions={config.genderDivisions}
          categoryDivisions={config.categoryDivisions}
          femenilCategoryDivision={getFemenilCategoryDivision(config)}
        />
      </div>
    </div>
  );
}
