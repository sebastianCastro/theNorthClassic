import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Términos de uso",
  description: "Términos de uso del sitio The North Classic.",
  path: "/terminos",
});

export default function TerminosPage() {
  return (
    <div className="section-padding container-north max-w-3xl text-muted">
      <h1 className="heading-display mb-8 text-4xl text-white">
        Términos de uso
      </h1>
      <p>
        El uso de este sitio implica la aceptación de nuestras políticas de
        contenido, propiedad intelectual de material audiovisual del torneo y
        conducta deportiva en eventos presenciales.
      </p>
    </div>
  );
}
