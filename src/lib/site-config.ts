import { prisma } from "./prisma";
import { parseJsonField } from "./utils";

export type DivisionGroup = {
  genderDivision: string;
  categoryDivision: string;
  label: string;
};

export type StatLeaderSlot = {
  genderDivision: string;
  categoryDivision: string;
  statKey: string;
  statLabel: string;
  playerSlug?: string;
};

export type SiteConfig = {
  genderDivisions: string[];
  categoryDivisions: string[];
  rules: string[];
  faqs: { q: string; a: string }[];
  featuredPlayerSlugs: string[];
  statLeaders: StatLeaderSlot[];
  sponsorDisplaySlots: number;
  recruiterDisplaySlots: number;
  scholarshipsCount: number;
  tournament: {
    name?: string;
    edition?: string;
    description?: string;
    location?: string;
    venue?: string;
    venueMapUrl?: string;
    startDate?: string;
    endDate?: string;
    registrationUrl?: string;
  };
};

export const STAT_LEADER_KEYS = [
  { key: "points", label: "Líder en Puntos" },
  { key: "rebounds", label: "Líder en Rebotes" },
  { key: "assists", label: "Líder en Asistencias" },
  { key: "steals", label: "Líder en Robos" },
  { key: "blocks", label: "Líder en Tapones" },
] as const;

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  genderDivisions: ["Varonil", "Femenil"],
  categoryDivisions: ["2007-2009", "2010-2011"],
  rules: [],
  faqs: [],
  featuredPlayerSlugs: [],
  statLeaders: [],
  sponsorDisplaySlots: 10,
  recruiterDisplaySlots: 5,
  scholarshipsCount: 0,
  tournament: {},
};

export function divisionLabel(
  categoryDivision: string,
  genderDivision: string
): string {
  return `${categoryDivision} ${genderDivision}`;
}

/** Femenil competes in a single category (first entry in site config). */
export function getFemenilCategoryDivision(config: SiteConfig): string {
  return config.categoryDivisions[0] ?? "2007-2009";
}

export function divisionGroupKey(group: {
  categoryDivision: string;
  genderDivision: string;
}): string {
  return `${group.categoryDivision}|${group.genderDivision}`;
}

/** Public tournament divisions: each Varonil category + one Femenil category. */
export function getDivisionGroups(config: SiteConfig): DivisionGroup[] {
  const groups: DivisionGroup[] = [];
  for (const cat of config.categoryDivisions) {
    groups.push({
      categoryDivision: cat,
      genderDivision: "Varonil",
      label: divisionLabel(cat, "Varonil"),
    });
  }
  if (config.genderDivisions.includes("Femenil")) {
    const femenilCat = getFemenilCategoryDivision(config);
    groups.push({
      categoryDivision: femenilCat,
      genderDivision: "Femenil",
      label: divisionLabel(femenilCat, "Femenil"),
    });
  }
  return groups;
}

export function isPublicDivision(
  group: { categoryDivision: string; genderDivision: string },
  config: SiteConfig
): boolean {
  const allowed = new Set(getDivisionGroups(config).map(divisionGroupKey));
  return allowed.has(divisionGroupKey(group));
}

export function parseSiteConfig(raw: string | null | undefined): SiteConfig {
  const parsed = parseJsonField<Partial<SiteConfig>>(raw);
  if (!parsed) return { ...DEFAULT_SITE_CONFIG };
  return {
    genderDivisions:
      parsed.genderDivisions?.length
        ? parsed.genderDivisions
        : DEFAULT_SITE_CONFIG.genderDivisions,
    categoryDivisions:
      parsed.categoryDivisions?.length
        ? parsed.categoryDivisions
        : DEFAULT_SITE_CONFIG.categoryDivisions,
    rules: parsed.rules ?? [],
    faqs: parsed.faqs ?? [],
    featuredPlayerSlugs: parsed.featuredPlayerSlugs ?? [],
    statLeaders: parsed.statLeaders ?? [],
    sponsorDisplaySlots:
      parsed.sponsorDisplaySlots ?? DEFAULT_SITE_CONFIG.sponsorDisplaySlots,
    recruiterDisplaySlots:
      parsed.recruiterDisplaySlots ?? DEFAULT_SITE_CONFIG.recruiterDisplaySlots,
    scholarshipsCount:
      parsed.scholarshipsCount ?? DEFAULT_SITE_CONFIG.scholarshipsCount,
    tournament: { ...DEFAULT_SITE_CONFIG.tournament, ...parsed.tournament },
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
  });
  return parseSiteConfig(settings?.configJson);
}

export async function saveSiteConfig(config: SiteConfig) {
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { configJson: JSON.stringify(config) },
    create: { id: "main", configJson: JSON.stringify(config) },
  });
}

export function buildStatLeaderGrid(
  config: SiteConfig,
  groups?: DivisionGroup[]
): StatLeaderSlot[] {
  const divisionGroups = groups?.length ? groups : getDivisionGroups(config);
  const slots: StatLeaderSlot[] = [];
  for (const group of divisionGroups) {
    for (const stat of STAT_LEADER_KEYS) {
      const existing = config.statLeaders.find(
        (s) =>
          s.categoryDivision === group.categoryDivision &&
          s.genderDivision === group.genderDivision &&
          s.statKey === stat.key
      );
      slots.push(
        existing ?? {
          categoryDivision: group.categoryDivision,
          genderDivision: group.genderDivision,
          statKey: stat.key,
          statLabel: stat.label,
        }
      );
    }
  }
  return slots;
}

export async function getDivisionGroupsFromTeams(): Promise<DivisionGroup[]> {
  const teams = await prisma.team.findMany({
    select: { genderDivision: true, categoryDivision: true },
  });
  const seen = new Set<string>();
  const groups: DivisionGroup[] = [];
  for (const t of teams) {
    const key = `${t.categoryDivision}|${t.genderDivision}`;
    if (seen.has(key)) continue;
    seen.add(key);
    groups.push({
      categoryDivision: t.categoryDivision,
      genderDivision: t.genderDivision,
      label: divisionLabel(t.categoryDivision, t.genderDivision),
    });
  }
  const config = await getSiteConfig();
  const filtered = groups.filter((g) => isPublicDivision(g, config));
  if (filtered.length > 0) {
    return filtered.sort((a, b) => a.label.localeCompare(b.label, "es"));
  }
  return getDivisionGroups(config);
}
