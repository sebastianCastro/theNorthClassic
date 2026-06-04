import { SectionHeading } from "@/components/ui/SectionHeading";
import { SponsorAdminForm } from "@/components/admin/SponsorAdminForm";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminPatrocinadoresPage() {
  const [sponsors, config] = await Promise.all([
    prisma.sponsor.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getSiteConfig(),
  ]);

  return (
    <div className="container-north max-w-3xl py-12">
      <SectionHeading
        eyebrow="CMS"
        title="Patrocinadores"
        subtitle="Agrega todos los que necesites. Controla cuántos se ven en inicio."
      />
      <div className="mt-10">
        <SponsorAdminForm
          sponsors={sponsors}
          displaySlots={config.sponsorDisplaySlots}
        />
      </div>
    </div>
  );
}
