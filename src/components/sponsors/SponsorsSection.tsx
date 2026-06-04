import { SectionHeading } from "@/components/ui/SectionHeading";
import { SponsorLogo } from "./SponsorLogo";

type Sponsor = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
};

type SponsorsSectionProps = {
  sponsors: Sponsor[];
  id?: string;
  className?: string;
};

export function SponsorsSection({
  sponsors,
  id,
  className = "section-padding border-b border-border",
}: SponsorsSectionProps) {
  if (sponsors.length === 0) return null;

  return (
    <section
      id={id}
      className={`${className}${id ? " scroll-mt-24" : ""}`}
    >
      <div className="container-north">
        <SectionHeading
          eyebrow="Confianza"
          title="Patrocinadores"
          align="center"
        />
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
          {sponsors.map((s) => (
            <a
              key={s.slug}
              href={s.websiteUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 transition-opacity hover:opacity-100"
              title={s.name}
            >
              <SponsorLogo name={s.name} logoUrl={s.logoUrl} height={56} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
