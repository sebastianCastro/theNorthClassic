import Link from "next/link";
import { NAV, SITE } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-north py-12 md:py-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="heading-display mb-4 text-3xl">
              THE NORTH <span className="text-accent">CLASSIC</span>
            </p>
            <p className="text-sm text-muted leading-relaxed">
              {SITE.description}
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">
              Navegación
            </h2>
            <ul className="space-y-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">
              Contacto
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="mailto:tiago.shoots2024@gmail.com"
                  className="hover:text-white"
                >
                  tiago.shoots2024@gmail.com
                </a>
              </li>
              <li>Chihuahua, Chihuahua, México</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">
              Legal
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/privacidad" className="hover:text-white">
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white">
                  Términos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {SITE.name}. Todos los derechos reservados.</p>
          <p>Hecho para el baloncesto juvenil de México con Cursor y ❤️ por <a href="https://www.linkedin.com/in/sebastiancaj/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">Sebastian Castro</a>.</p>
        </div>
      </div>
    </footer>
  );
}
