import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatLeadersAdminForm } from "@/components/admin/StatLeadersAdminForm";
import { prisma } from "@/lib/prisma";
import {
  getSiteConfig,
  buildStatLeaderGrid,
  getDivisionGroupsFromTeams,
} from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminLideresPage() {
  const [config, groups, players] = await Promise.all([
    getSiteConfig(),
    getDivisionGroupsFromTeams(),
    prisma.player.findMany({
      include: { team: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  const initialSlots = buildStatLeaderGrid(config, groups);
  const playerOptions = players
    .filter((p) => p.team)
    .map((p) => ({
      slug: p.slug,
      label: `${p.firstName} ${p.lastName} — ${p.team!.name}`,
      categoryDivision: p.team!.categoryDivision,
      genderDivision: p.team!.genderDivision,
    }));

  return (
    <div className="container-north max-w-4xl py-12">
      <SectionHeading
        eyebrow="CMS"
        title="Líderes en estadísticas"
        subtitle="Elige un jugador por categoría y estadística. Se muestra en la página de inicio."
      />
      <div className="mt-10">
        <StatLeadersAdminForm
          groups={groups}
          initialSlots={initialSlots}
          players={playerOptions}
        />
      </div>
    </div>
  );
}
