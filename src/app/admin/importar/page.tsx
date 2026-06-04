import { CsvImporter } from "@/components/admin/CsvImporter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <div className="container-north max-w-3xl py-12">
      <SectionHeading
        eyebrow="CMS"
        title="Importar datos"
        subtitle="Sube un CSV de equipos primero, luego el de jugadores. Vista previa y confirmación antes de guardar."
      />
      <div className="mt-10 space-y-16">
        <CsvImporter type="teams" />
        <CsvImporter
          type="players"
          teamNames={teams.map((t) => t.name)}
        />
      </div>
    </div>
  );
}
