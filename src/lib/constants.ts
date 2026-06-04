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
