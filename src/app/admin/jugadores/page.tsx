import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePlayer } from "../actions";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { DeleteAllPlayersButton } from "@/components/admin/DeleteAllPlayersButton";

export const dynamic = "force-dynamic";

export default async function AdminJugadoresPage() {
  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="container-north py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="heading-display text-4xl text-white">Jugadores</h1>
        <Link href="/admin/importar" className="btn-secondary text-xs">
          Importar CSV
        </Link>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {players.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-semibold text-white">
                {p.firstName} {p.lastName}
              </p>
              <p className="text-sm text-muted">
                {p.team?.name ?? p.importTeamName ?? "Sin equipo"} · #
                {p.jerseyNumber ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/jugadores/${p.id}`}
                className="text-xs text-white hover:underline"
              >
                Editar
              </Link>
              <Link
                href={`/jugadores/${p.slug}`}
                className="text-xs text-accent hover:underline"
              >
                Ver perfil
              </Link>
              <AdminDeleteButton
                label={`${p.firstName} ${p.lastName}`}
                onDelete={deletePlayer.bind(null, p.id)}
              />
            </div>
          </li>
        ))}
      </ul>
      {players.length === 0 && (
        <p className="text-muted">No hay jugadores registrados.</p>
      )}

      <DeleteAllPlayersButton count={players.length} />
    </div>
  );
}
