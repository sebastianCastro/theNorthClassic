import { prisma } from "@/lib/prisma";
import { GameAdminForm } from "@/components/admin/GameAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminPartidosPage() {
  const [teams, games] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.game.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);

  return (
    <div className="container-north py-12">
      <h1 className="heading-display mb-8 text-4xl text-white">Partidos</h1>
      {teams.length < 2 ? (
        <p className="mb-6 text-yellow-500">
          Importa al menos 2 equipos antes de crear partidos.
        </p>
      ) : null}
      <GameAdminForm teams={teams} games={games} />
    </div>
  );
}
