import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Nosotros",
  description:
    "Organización del showcase de basketball juvenil The North Classic en Chihuahua, México: misión, visión y equipo.",
  path: "/nosotros",
});

const LEADERS = [
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
] as const;

const DEPARTMENTS = [
  {
    title: "Director de Logística",
    members: ["Jesús Esparza"],
  },
  {
    title: "Equipo de Marketing",
    members: [
      "Carolina Moye",
      "Andrea Gutiérrez",
      "Daniela Calvo",
      "Camila Contreras",
      "Andrés Duarte",
      "Sofía Villegas",
    ],
  },
  {
    title: "Equipo estadísticas",
    members: [
      "Diego Almeida",
      "Camila Martínez",
      "Jenaro Bautista",
      "Ricardo Bautista",
      "Omar Guzmán",
      "Andrea Guerra",
      "Carolina Rosas",
      "Enrique Ontiveros",
      "Fernando Herrera",
      "Aixchel Hernández",
    ],
  },
  {
    title: "Tienda Oficial de Merch",
    members: [
      "Miguel Labrado",
      "Suset Hernández",
      "Aneth Carrasco",
      "Danna Ochoa",
    ],
  },
] as const;

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
            {LEADERS.map((person) => (
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

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {DEPARTMENTS.map((dept) => (
              <article
                key={dept.title}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <h3 className="font-semibold text-white leading-snug">
                  {dept.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {dept.members.map((member) => (
                    <li key={member} className="text-sm text-muted">
                      {member}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
