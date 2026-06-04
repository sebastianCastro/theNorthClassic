import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteTeam, linkPlayersToTeamsByImportName } from "../actions";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { divisionLabel } from "@/lib/site-config";
import { LinkTeamsButton } from "@/components/admin/LinkTeamsButton";

export const dynamic = "force-dynamic";

export default async function AdminEquiposPage() {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { players: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container-north py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="heading-display text-4xl text-white">Equipos</h1>
        <div className="flex gap-3">
          <LinkTeamsButton action={linkPlayersToTeamsByImportName} />
          <Link href="/admin/importar" className="btn-secondary text-xs">
            Importar CSV
          </Link>
        </div>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {teams.map((t) => (
          <li
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-semibold text-white">{t.name}</p>
              <p className="text-sm text-muted">
                {divisionLabel(t.categoryDivision, t.genderDivision)} ·{" "}
                {t._count.players} jugador{t._count.players !== 1 ? "es" : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/equipos/${t.id}`}
                className="text-xs text-white hover:underline"
              >
                Editar
              </Link>
              <Link
                href={`/equipos/${t.slug}`}
                className="text-xs text-accent hover:underline"
              >
                Ver público
              </Link>
              <AdminDeleteButton
                label={t.name}
                onDelete={deleteTeam.bind(null, t.id)}
              />
            </div>
          </li>
        ))}
      </ul>
      {teams.length === 0 && (
        <p className="text-muted">No hay equipos. Importa desde CSV.</p>
      )}
    </div>
  );
}
