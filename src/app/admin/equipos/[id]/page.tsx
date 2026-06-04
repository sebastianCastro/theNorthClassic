import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTeam } from "@/app/admin/actions";
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

      <form
        action={updateTeam.bind(null, id)}
        className="mt-8 space-y-4 rounded-lg border border-border p-6"
      >
        <label className="block text-xs text-muted">
          Nombre
          <input name="name" defaultValue={team.name} required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
        </label>
        <label className="block text-xs text-muted">
          URL del logo
          <input name="logoUrl" defaultValue={team.logoUrl ?? ""} type="url" className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
        </label>
        <label className="block text-xs text-muted">
          Género
          <select name="genderDivision" defaultValue={team.genderDivision} className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white">
            <option value="Varonil">Varonil</option>
            <option value="Femenil">Femenil</option>
          </select>
        </label>
        <label className="block text-xs text-muted">
          Categoría
          <input name="categoryDivision" defaultValue={team.categoryDivision} required className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
        </label>
        <label className="block text-xs text-muted">
          Entrenadores
          <input name="coaches" defaultValue={team.coaches ?? ""} className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
        </label>
        <label className="block text-xs text-muted">
          Descripción
          <textarea name="description" defaultValue={team.description ?? ""} rows={3} className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white" />
        </label>
        <button type="submit" className="btn-primary">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
