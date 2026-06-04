import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Nosotros",
  description:
    "Organización del showcase de basketball juvenil The North Classic en Chihuahua, México: misión, visión y equipo.",
  path: "/nosotros",
});

const LEADERSHIP = [
  {
    name: 'Santiago "Tiago" Contreras Bautista',
    role: "Fundador y Director General",
    bio: "Promotor del talento juvenil y creador de Tiago Shoots. Apasionado por el desarrollo del basketball mexicano y la creación de oportunidades que conecten a los jugadores con el siguiente nivel académico y deportivo.",
  },
  {
    name: "Camila Contreras Bautista",
    role: "Diseño Gráfico y Comunicación Visual",
    bio: "Responsable del desarrollo visual de The North Classic. Encargada de la identidad gráfica del evento y del diseño de contenido para redes sociales y materiales promocionales.",
  },
  {
    name: "Carolina Moye",
    role: "Mercadotecnia",
    bio: "Encargada de las estrategias de promoción, posicionamiento y vinculación del evento, contribuyendo al crecimiento de la comunidad y al alcance de The North Classic.",
  },
  {
    name: "Andrea Gutiérrez",
    role: "Mercadotecnia",
    bio: "Encargada de las estrategias de promoción, posicionamiento y vinculación del evento, contribuyendo al crecimiento de la comunidad y al alcance de The North Classic.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="section-padding">
      <div className="container-north max-w-3xl">
        <SectionHeading
          eyebrow="Organización"
          title="Nosotros"
          subtitle="Estableciendo el estándar del baloncesto juvenil showcase en México."
        />

        <section className="mb-16">
          <h2 className="heading-display mb-4 text-3xl text-white">Misión</h2>
          <p className="leading-relaxed text-muted">
            Brindar una plataforma de alto nivel para la exposición y desarrollo
            de jóvenes basquetbolistas, conectando el talento de México con
            oportunidades universitarias mediante un evento competitivo,
            profesional y de gran impacto deportivo y académico.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="heading-display mb-4 text-3xl text-white">Visión</h2>
          <p className="leading-relaxed text-muted">
            Convertir a THE NORTH CLASSIC en uno de los torneos showcase más
            importantes de México, reconocido por impulsar el talento juvenil,
            elevar el nivel del basketball nacional y generar oportunidades
            reales de becas y crecimiento para los atletas participantes.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="heading-display mb-4 text-3xl text-white">Objetivo</h2>
          <p className="leading-relaxed text-muted">
            Crear una experiencia deportiva elite que reúna a jugadores,
            entrenadores universitarios y organizaciones deportivas en un
            entorno competitivo y profesional, facilitando la proyección de
            talento, el desarrollo integral de los atletas y la construcción de
            oportunidades académicas y deportivas para las nuevas generaciones.
          </p>
        </section>

        <section>
          <h2 className="heading-display mb-3 text-3xl text-white">
            Liderazgo
          </h2>
          <p className="mb-8 max-w-2xl text-muted leading-relaxed">
            Un equipo comprometido con crear oportunidades para la próxima
            generación del basketball mexicano.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {LEADERSHIP.map((person) => (
              <article
                key={person.name}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <h3 className="font-semibold text-white leading-snug">
                  {person.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-accent">
                  {person.role}
                </p>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  {person.bio}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
