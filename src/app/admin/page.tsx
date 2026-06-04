import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import { saveScholarshipsCount } from "./actions";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [players, teams, games, config] = await Promise.all([
    prisma.player.count(),
    prisma.team.count(),
    prisma.game.count(),
    getSiteConfig(),
  ]);

  const stats = [
    { label: "Jugadores", count: players, href: "/admin/jugadores" },
    { label: "Equipos", count: teams, href: "/admin/equipos" },
    { label: "Partidos", count: games, href: "/admin/partidos" },
  ];

  return (
    <div className="container-north py-12">
      <h1 className="heading-display text-4xl text-white">Dashboard</h1>
      <p className="mt-2 text-muted">
        Bienvenido, {session.user?.name ?? session.user?.email}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card-hover rounded-lg border border-border bg-surface p-6"
          >
            <p className="text-xs uppercase tracking-widest text-muted">
              {s.label}
            </p>
            <p className="stat-number mt-2 text-4xl font-bold text-white">
              {s.count}
            </p>
          </Link>
        ))}
      </div>

      <form
        action={async (fd) => {
          "use server";
          const n = parseInt(String(fd.get("scholarships")), 10);
          await saveScholarshipsCount(Number.isFinite(n) ? n : 0);
        }}
        className="mt-8 max-w-md rounded-lg border border-border bg-surface p-6"
      >
        <h2 className="font-semibold text-white">Becas en inicio</h2>
        <p className="mt-1 text-sm text-muted">
          Estadística &ldquo;La liga en cifras&rdquo;. Deja en 0 para mostrar
          signo de interrogación.
        </p>
        <div className="mt-4 flex items-end gap-3">
          <label className="block flex-1 text-xs text-muted">
            Becas obtenidas
            <input
              name="scholarships"
              type="number"
              min={0}
              defaultValue={config.scholarshipsCount}
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </label>
          <button type="submit" className="btn-secondary text-sm shrink-0">
            Guardar
          </button>
        </div>
      </form>

      <div className="mt-12 rounded-lg border border-border p-6">
        <h2 className="font-semibold text-white">Flujo recomendado</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>
            <Link href="/admin/importar" className="text-accent hover:underline">
              Importar CSV
            </Link>{" "}
            (equipos, luego jugadores)
          </li>
          <li>
            <Link href="/admin/partidos" className="text-accent hover:underline">
              Crear partidos y capturar marcadores
            </Link>
          </li>
          <li>
            <Link href="/admin/lideres" className="text-accent hover:underline">
              Asignar líderes en estadísticas
            </Link>
          </li>
          <li>
            <Link href="/admin/patrocinadores" className="text-accent hover:underline">
              Gestionar patrocinadores
            </Link>
          </li>
          <li>
            <Link href="/admin/faqs" className="text-accent hover:underline">
              Editar preguntas frecuentes
            </Link>
          </li>
        </ol>
      </div>
    </div>
  );
}
