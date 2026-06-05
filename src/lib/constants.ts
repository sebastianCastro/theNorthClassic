export const SITE = {
  name: "The North Classic",
  tagline: "Donde el talento encuentra la oportunidad",
  description:
    "Showcase de basketball juvenil en Chihuahua, México: competencia, estadísticas y exposición ante reclutadores universitarios.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenorthclassic.mx",
  locale: "es-MX",
} as const;

/** Tournament location — use in schema, seed, and SEO (not necessarily all UI copy). */
export const TOURNAMENT_LOCATION = {
  city: "Chihuahua",
  state: "Chihuahua",
  country: "MX",
  countryName: "México",
  label: "Chihuahua, Chihuahua, México",
} as const;

/** Google Maps iframe embed for Instituto La Salle Chihuahua (no API key). */
export const TOURNAMENT_VENUE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=Gimnasio+del+Instituto+La+Salle+Chihuahua,+Av.+Pol%C3%ADtecnico+Nacional+5100,+Chihuahua,+Chihuahua,+Mexico&hl=es&z=17&output=embed";

const BROKEN_VENUE_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3593.0!2d-100.3!3d25.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1";

/** Replace hand-crafted partial `pb=` embed URLs that Google rejects. */
export function resolveVenueMapEmbedUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (
    trimmed === BROKEN_VENUE_MAP_EMBED_URL ||
    (trimmed.includes("/maps/embed?pb=") && trimmed.length < 200)
  ) {
    return TOURNAMENT_VENUE_MAP_EMBED_URL;
  }
  return trimmed;
}

/** Default meta description (search/social); visible footer copy uses SITE.description. */
export const SITE_SEO_DESCRIPTION =
  "Torneo de basketball juvenil y showcase universitario en Chihuahua, México. The North Classic: exposición ante reclutadores, estadísticas y cobertura oficial.";

export const SITE_CONTACT_EMAIL = "tiago.shoots2024@gmail.com";

export const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/torneo", label: "Torneo" },
  { href: "/equipos", label: "Equipos" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/partidos", label: "Partidos" },
  { href: "/media", label: "Media" },
  { href: "/nosotros", label: "Nosotros" },
] as const;

export const POSITION_LABELS: Record<string, string> = {
  PG: "Base",
  SG: "Escolta",
  SF: "Alero",
  PF: "Ala-pívot",
  C: "Pívot",
};

export const CATEGORY_LABELS: Record<string, string> = {
  Varonil: "Varonil",
  Femenil: "Femenil",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export const COLORS = {
  black: "#070707",
  northRed: "#9B111E",
  brightRed: "#D72638",
  white: "#FFFFFF",
  gray100: "#EAEAEA",
  gray400: "#A3A3A3",
  gray600: "#555555",
  success: "#22C55E",
} as const;
