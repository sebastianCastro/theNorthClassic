import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-border bg-black">
        <div className="container-north flex h-14 items-center justify-between">
          <Link
            href="/admin"
            className="text-sm font-semibold uppercase tracking-widest text-white"
          >
            Panel Admin
          </Link>
          <nav className="flex flex-wrap gap-3 text-xs uppercase tracking-wider">
            <Link href="/admin" className="text-muted hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/equipos" className="text-muted hover:text-white">
              Equipos
            </Link>
            <Link href="/admin/jugadores" className="text-muted hover:text-white">
              Jugadores
            </Link>
            <Link href="/admin/partidos" className="text-muted hover:text-white">
              Partidos
            </Link>
            <Link href="/admin/lideres" className="text-muted hover:text-white">
              Líderes
            </Link>
            <Link href="/admin/patrocinadores" className="text-muted hover:text-white">
              Patrocinadores
            </Link>
            <Link href="/admin/reclutadores" className="text-muted hover:text-white">
              Reclutadores
            </Link>
            <Link href="/admin/faqs" className="text-muted hover:text-white">
              FAQ
            </Link>
            <Link href="/admin/importar" className="text-muted hover:text-white">
              Importar CSV
            </Link>
            <Link href="/" className="text-accent hover:underline">
              Ver sitio
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
