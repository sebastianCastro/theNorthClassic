import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayerPhotoForm } from "@/components/admin/PlayerPhotoForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, teams] = await Promise.all([
    prisma.player.findUnique({ where: { id } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!player) notFound();

  return (
    <div className="container-north max-w-lg py-12">
      <Link href="/admin/jugadores" className="text-xs text-accent hover:underline">
        ← Jugadores
      </Link>
      <h1 className="heading-display mt-4 text-3xl text-white">Editar jugador</h1>
      <p className="mt-1 text-muted">
        {player.firstName} {player.lastName}
      </p>

      <PlayerPhotoForm
        playerId={player.id}
        firstName={player.firstName}
        lastName={player.lastName}
        photoUrl={player.photoUrl}
        jerseyNumber={player.jerseyNumber}
        teamId={player.teamId}
        teams={teams}
      />
    </div>
  );
}
