import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinksHub } from "@/components/media/SocialLinksHub";
import { getMediaSocialLinks } from "@/lib/social-links";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Media Center",
  description:
    "Cobertura oficial del torneo de basketball en Chihuahua: The North Classic y Tiago Shoots en Instagram, Facebook, TikTok y YouTube.",
  path: "/media",
});

export default async function MediaPage() {
  const links = await getMediaSocialLinks();

  return (
    <div className="section-padding">
      <div className="container-north">
        <SectionHeading
          eyebrow="Redes"
          title="Media Center"
          subtitle="Sigue la cobertura oficial del torneo."
          className="mb-6 md:mb-8"
        />
        <SocialLinksHub links={links} />
      </div>
    </div>
  );
}
