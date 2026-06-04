import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RecruitersGrid } from "@/components/torneo/RecruitersGrid";
import { SponsorsSection } from "@/components/sponsors/SponsorsSection";
import {
  getActiveTournament,
  getSponsorsForHome,
  getRecruitersForTorneo,
} from "@/lib/data";
import { FaqAnswer } from "@/components/torneo/FaqAnswer";
import { getSiteConfig } from "@/lib/site-config";
import { getTorneoDivisions } from "@/lib/tournament-divisions";
import { buildMetadata, sportsEventJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { formatDateMX, parseJsonField } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Torneo",
  description:
    "The North Classic en Chihuahua: torneo de basketball juvenil, showcase universitario, divisiones, reclutadores y sede del evento.",
  path: "/torneo",
});

export default async function TorneoPage() {
  const [tournament, sponsors, recruiters, siteConfig, divisions] =
    await Promise.all([
      getActiveTournament(),
      getSponsorsForHome(),
      getRecruitersForTorneo(),
      getSiteConfig(),
      getTorneoDivisions(),
    ]);

  if (!tournament) {
    return (
      <div className="section-padding container-north">
        <p className="text-muted">No hay torneo activo en este momento.</p>
      </div>
    );
  }

  const faqFromTournament =
    parseJsonField<{ q: string; a: string }[]>(tournament.faq) ?? [];
  const faq =
    siteConfig.faqs.length > 0 ? siteConfig.faqs : faqFromTournament;
  const eventLd = sportsEventJsonLd({
    name: tournament.name,
    edition: tournament.edition,
    startDate: tournament.startDate.toISOString(),
    endDate: tournament.endDate.toISOString(),
    location: tournament.location,
    url: `${SITE.url}/torneo`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
      <div className="section-padding">
        <div className="container-north">
          <SectionHeading
            eyebrow="Edición actual"
            title={tournament.name}
            subtitle={tournament.edition ?? undefined}
          />

          <div className="prose-north mb-16 grid gap-8 lg:grid-cols-2">
            <div className="space-y-6 text-muted">
              <p className="text-lg text-gray-100 leading-relaxed">
                El torneo que funciona como una plataforma de reclutamiento
                universitario en Chihuahua, Chihuahua. Tres días de intensa
                competencia, exposición ante reclutadores y cobertura mediática
                profesional.
              </p>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-widest">Ubicación</dt>
                  <dd className="text-white">{tournament.location}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest">Fechas</dt>
                  <dd className="text-white">
                    {formatDateMX(tournament.startDate)} —{" "}
                    {formatDateMX(tournament.endDate)}
                  </dd>
                </div>
                {tournament.venue && (
                  <div>
                    <dt className="text-xs uppercase tracking-widest">Sede</dt>
                    <dd className="text-white">{tournament.venue}</dd>
                  </div>
                )}
              </dl>
              <Link href="/media" className="btn-primary inline-flex">
                Media Center
              </Link>
            </div>
            {tournament.venueMapUrl && (
              <iframe
                title="Mapa de la sede"
                src={tournament.venueMapUrl}
                className="min-h-[300px] w-full rounded-lg border border-border"
                loading="lazy"
              />
            )}
          </div>

          <RecruitersGrid recruiters={recruiters} />

          {divisions.length > 0 && (
            <section className="mb-16">
              <h2 className="heading-display mb-6 text-3xl text-white">
                Categorías
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {divisions.map((d) => (
                  <div
                    key={d.name}
                    className="rounded-lg border border-border p-6"
                  >
                    <h3 className="font-semibold text-white">{d.name}</h3>
                    <p className="mt-2 text-sm text-muted">{d.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {faq.length > 0 && (
            <section className="mb-16">
              <h2 className="heading-display mb-6 text-3xl text-white">FAQ</h2>
              <div className="space-y-4">
                {faq.map((item, index) => (
                  <details
                    key={`${index}-${item.q}`}
                    className="group rounded-lg border border-border bg-surface"
                  >
                    <summary className="cursor-pointer list-none p-6 font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                      {item.q}
                    </summary>
                    <div className="border-t border-border px-6 pb-6 pt-4">
                      <FaqAnswer answer={item.a} asList={index === 0} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <SponsorsSection
            sponsors={sponsors}
            className="mb-16 border-t border-border pt-16"
          />
        </div>
      </div>
    </>
  );
}
