import Image from "next/image";
import type { MediaSocialLinks } from "@/lib/social-links";
import { SocialIconLinks } from "./SocialIconLinks";

function BrandCard({
  logoSrc,
  logoWidth,
  logoHeight,
  logoClassName,
  title,
  titleAccent,
  description,
  links,
}: {
  logoSrc: string;
  logoWidth: number;
  logoHeight: number;
  logoClassName: string;
  title: string;
  titleAccent: string;
  description: string;
  links: MediaSocialLinks["north"];
}) {
  return (
    <article className="flex h-full flex-col items-center rounded-lg border border-border bg-surface px-6 py-8 text-center sm:px-8">
      <Image
        src={logoSrc}
        alt=""
        width={logoWidth}
        height={logoHeight}
        className={logoClassName}
      />
      <h2 className="heading-display mt-6 text-2xl text-white sm:text-3xl">
        {title}{" "}
        <span className="text-accent">{titleAccent}</span>
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
        {description}
      </p>
      <div className="mt-6">
        <SocialIconLinks links={links} />
      </div>
    </article>
  );
}

export function SocialLinksHub({ links }: { links: MediaSocialLinks }) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <BrandCard
          logoSrc="/the-north-logo.png"
          logoWidth={88}
          logoHeight={88}
          logoClassName="h-20 w-auto object-contain sm:h-[5.5rem]"
          title="THE NORTH"
          titleAccent="CLASSIC"
          description="Cuenta oficial del torneo."
          links={links.north}
        />
        <BrandCard
          logoSrc="/tiago-shoots-logo.png"
          logoWidth={80}
          logoHeight={80}
          logoClassName="h-20 w-auto max-w-[5.5rem] object-contain sm:h-[5.5rem] sm:max-w-none"
          title="TIAGO"
          titleAccent="SHOOTS"
          description="Producción audiovisual y contenido deportivo."
          links={links.tiago}
        />
      </div>

      <p className="mx-auto mt-8 max-w-[700px] text-center text-sm leading-relaxed text-muted sm:text-base">
        <span className="font-semibold text-gray-300">THE NORTH CLASSIC</span>{" "}
        es un evento creado y producido por{" "}
        <span className="text-white">Tiago Shoots</span>, una plataforma
        enfocada en impulsar y proyectar el talento del basketball a través de
        contenido deportivo, experiencias competitivas y oportunidades de
        exposición universitaria.
      </p>
    </div>
  );
}
