import { SectionHeading } from "@/components/ui/SectionHeading";
import { RecruiterAdminForm } from "@/components/admin/RecruiterAdminForm";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminReclutadoresPage() {
  const [recruiters, config] = await Promise.all([
    prisma.recruiter.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getSiteConfig(),
  ]);

  return (
    <div className="container-north max-w-3xl py-12">
      <SectionHeading
        eyebrow="CMS"
        title="Perfiles de reclutadores"
        subtitle="Agrega los confirmados. Controla cuántos se muestran en la página del torneo."
      />
      <div className="mt-10">
        <RecruiterAdminForm
          recruiters={recruiters}
          displaySlots={config.recruiterDisplaySlots}
        />
      </div>
    </div>
  );
}
