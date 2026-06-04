import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayerGallery } from "@/components/players/PlayerGallery";
import { PlayerResumeButton } from "@/components/players/PlayerResumeButton";
import { getPlayerBySlug } from "@/lib/data";
import { POSITION_LABELS, SITE } from "@/lib/constants";
import { divisionLabel } from "@/lib/site-config";
import {
  buildMetadata,
  breadcrumbJsonLd,
  personJsonLd,
  videoJsonLd,
} from "@/lib/seo";
import {
  formatDateMX,
  formatHeight,
  getYouTubeEmbedUrl,
  parseAchievementsJson,
} from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return {};
  const name = `${player.firstName} ${player.lastName}`;
  return buildMetadata({
    title: name,
    description:
      player.biography?.slice(0, 160) ??
      `Perfil de ${name} en el showcase de basketball The North Classic, Chihuahua. ${player.team?.name ?? ""} · ${POSITION_LABELS[player.position ?? ""] ?? ""}`,
    path: `/jugadores/${slug}`,
    image: player.photoUrl ?? undefined,
    type: "profile",
  });
}

export default async function PlayerProfilePage({ params }: Props) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const name = `${player.firstName} ${player.lastName}`;
  const achievements = parseAchievementsJson(player.achievements);
  const embedUrl = player.highlightUrl
    ? getYouTubeEmbedUrl(player.highlightUrl)
    : null;
  const profileUrl = `${SITE.url}/jugadores/${slug}`;

  const jsonLd = [
    personJsonLd({
      name,
      url: profileUrl,
      image: player.photoUrl,
      team: player.team?.name,
      position: player.position
        ? POSITION_LABELS[player.position]
        : undefined,
      height: formatHeight(player.heightCm),
    }),
    breadcrumbJsonLd([
      { name: "Inicio", url: SITE.url },
      { name: "Jugadores", url: `${SITE.url}/jugadores` },
      { name, url: profileUrl },
    ]),
    ...(embedUrl && player.highlightUrl
      ? [
          videoJsonLd({
            name: `Highlights de ${name}`,
            description: `Mejores jugadas de ${name}`,
            thumbnailUrl: player.photoUrl ?? `${SITE.url}/og-default.jpg`,
            uploadDate: player.updatedAt.toISOString(),
            embedUrl,
          }),
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border bg-surface">
        <div className="container-north py-8 md:py-10 lg:py-12">
          <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-muted">
            <Link href="/jugadores" className="hover:text-white">
              Jugadores
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-lg border border-border lg:mx-0">
              <Image
                src={
                  player.photoUrl ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9B111E&color=fff&size=512`
                }
                alt={name}
                fill
                className="object-cover object-top"
                priority
                sizes="320px"
              />
              {player.jerseyNumber != null && (
                <span className="stat-number absolute right-4 top-4 text-6xl font-bold text-white/25">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            <div>
              <p className="text-sm uppercase tracking-widest text-accent">
                {player.team?.name ?? "Sin equipo asignado"}
              </p>
              <h1 className="heading-display mt-2 text-5xl text-white md:text-6xl lg:text-7xl">
                {name}
              </h1>

              <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  {
                    label: "Posición",
                    value: player.position
                      ? POSITION_LABELS[player.position]
                      : "—",
                  },
                  { label: "Altura", value: formatHeight(player.heightCm) },
                  {
                    label: "Peso",
                    value: player.weightKg ? `${player.weightKg} kg` : "—",
                  },
                  {
                    label: "Edad",
                    value: player.age ? `${player.age} años` : "—",
                  },
                  {
                    label: "Nacimiento",
                    value: player.birthdate
                      ? formatDateMX(player.birthdate)
                      : "—",
                  },
                  {
                    label: "Envergadura",
                    value: player.wingspanCm
                      ? formatHeight(player.wingspanCm)
                      : "—",
                  },
                  {
                    label: "División",
                    value:
                      player.categoryDivision && player.genderDivision
                        ? divisionLabel(
                            player.categoryDivision,
                            player.genderDivision
                          )
                        : "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded border border-border bg-black/40 p-4"
                  >
                    <dt className="text-xs uppercase tracking-widest text-muted">
                      {item.label}
                    </dt>
                    <dd className="stat-number mt-1 text-lg font-medium text-white">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {achievements.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
                    Logros en cancha
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {achievements.map((a, i) => (
                      <li key={i} className="flex gap-2 text-gray-100">
                        <span className="text-accent">▸</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {player.biography && (
                <p className="mt-8 leading-relaxed text-muted">
                  {player.biography}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-4">
                <PlayerResumeButton
                  data={{
                    name,
                    team: player.team?.name ?? "—",
                    position: player.position
                      ? POSITION_LABELS[player.position]
                      : "—",
                    height: formatHeight(player.heightCm),
                    weight: player.weightKg ? `${player.weightKg} kg` : "—",
                    jersey: player.jerseyNumber
                      ? `#${player.jerseyNumber}`
                      : "—",
                    age: player.age ? `${player.age}` : "—",
                    achievements,
                    bio: player.biography ?? "",
                  }}
                />
                {player.highlightUrl && (
                  <a
                    href={player.highlightUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Ver highlights
                  </a>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                {player.instagram && (
                  <a
                    href={player.instagram.startsWith("http") ? player.instagram : `https://instagram.com/${player.instagram.replace("@", "")}`}
                    className="text-sm text-muted hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                )}
                {player.youtube && (
                  <a
                    href={player.youtube.startsWith("http") ? player.youtube : `https://youtube.com/${player.youtube}`}
                    className="text-sm text-muted hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {embedUrl && (
        <section className="section-padding border-b border-border">
          <div className="container-north">
            <h2 className="heading-display mb-8 text-4xl text-white">
              Highlights
            </h2>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
              <iframe
                src={embedUrl}
                title={`Video highlights de ${name}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {player.awards.length > 0 && (
        <section className="section-padding border-b border-border bg-surface">
          <div className="container-north">
            <h2 className="heading-display mb-8 text-4xl text-white">
              Premios y reconocimientos
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {player.awards.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-border p-6"
                >
                  <p className="font-semibold text-white">{a.title}</p>
                  {a.year && (
                    <p className="stat-number mt-1 text-sm text-muted">
                      {a.year}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {player.photos.length > 0 && (
        <section className="section-padding">
          <div className="container-north">
            <h2 className="heading-display mb-8 text-4xl text-white">
              Galería
            </h2>
            <PlayerGallery photos={player.photos} />
          </div>
        </section>
      )}
    </>
  );
}
