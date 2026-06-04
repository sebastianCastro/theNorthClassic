import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Aviso de privacidad",
  description: "Aviso de privacidad de The North Classic.",
  path: "/privacidad",
});

export default function PrivacidadPage() {
  return (
    <div className="section-padding container-north max-w-3xl prose-north text-muted">
      <h1 className="heading-display mb-8 text-4xl text-white">
        Aviso de privacidad
      </h1>
      <p>
        The North Classic respeta tu privacidad conforme a la Ley Federal de
        Protección de Datos Personales en Posesión de los Particulares (México).
        Los datos recopilados mediante formularios de registro se utilizan
        únicamente para operación del torneo, perfiles de jugadores y
        comunicación relacionada con el evento.
      </p>
    </div>
  );
}
