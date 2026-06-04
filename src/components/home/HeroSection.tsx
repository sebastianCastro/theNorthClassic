import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-end overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=85"
        alt="Acción de basketball en cancha — The North Classic, Chihuahua, México"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 gradient-hero" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(215,38,56,0.2),transparent_50%)]" aria-hidden />

      <div className="container-north relative z-10 pb-12 pt-20 md:pb-16 md:pt-24 lg:pb-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Basketball Showcase · Chihuahua, México
        </p>
        <h1 className="heading-display max-w-4xl text-5xl text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Donde el talento encuentra la oportunidad
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-100 md:text-xl">
          El torneo que funciona como una plataforma de reclutamiento universitario.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/equipos" className="btn-primary">
            Explorar equipos
          </Link>
          <Link href="/partidos" className="btn-secondary">
            Ver partidos
          </Link>
        </div>
      </div>
    </section>
  );
}
