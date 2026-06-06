import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAdminForm } from "@/components/admin/FaqAdminForm";
import { getActiveTournament } from "@/lib/data";
import { getSiteConfig, resolveTorneoFaqs } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const [config, tournament] = await Promise.all([
    getSiteConfig(),
    getActiveTournament(),
  ]);
  const faqs = resolveTorneoFaqs(config.faqs, tournament?.faq);

  return (
    <div className="container-north max-w-3xl py-12">
      <SectionHeading
        eyebrow="CMS"
        title="Preguntas frecuentes"
        subtitle="Edita las FAQ que aparecen en la página del torneo."
      />
      <div className="mt-10">
        <FaqAdminForm initialFaqs={faqs} />
      </div>
    </div>
  );
}
