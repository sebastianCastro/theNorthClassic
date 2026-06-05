import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import { ScholarshipsAdminForm } from "@/components/admin/ScholarshipsAdminForm";
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

      <ScholarshipsAdminForm initialCount={config.scholarshipsCount} />

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
