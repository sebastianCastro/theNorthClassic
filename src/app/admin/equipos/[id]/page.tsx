import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamAdminForm } from "@/components/admin/TeamAdminForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) notFound();

  return (
    <div className="container-north max-w-lg py-12">
      <Link href="/admin/equipos" className="text-xs text-accent hover:underline">
        ← Equipos
      </Link>
      <h1 className="heading-display mt-4 text-3xl text-white">Editar equipo</h1>
      <p className="mt-1 text-muted">{team.name}</p>
      <TeamAdminForm team={team} />
    </div>
  );
}
