import { prisma } from "./prisma";
import { getSiteConfig, divisionLabel, getDivisionGroups } from "./site-config";

export async function getFeaturedPlayers(limit = 8) {
  const config = await getSiteConfig();
  if (config.featuredPlayerSlugs.length > 0) {
    const players = await prisma.player.findMany({
      where: { slug: { in: config.featuredPlayerSlugs }, featured: true },
      include: { team: true },
    });
    return players.map(mapPlayerCard);
  }
  const players = await prisma.player.findMany({
    where: { featured: true },
    include: { team: true },
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
  return players.map(mapPlayerCard);
}

export async function getAllPlayers(filters?: {
  genderDivision?: string;
  categoryDivision?: string;
}) {
  const players = await prisma.player.findMany({
    where: {
      ...(filters?.genderDivision && { genderDivision: filters.genderDivision }),
      ...(filters?.categoryDivision && {
        categoryDivision: filters.categoryDivision,
      }),
    },
    include: { team: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return players.map(mapPlayerCard);
}

export async function getPlayerBySlug(slug: string) {
  return prisma.player.findUnique({
    where: { slug },
    include: {
      team: true,
      photos: { orderBy: { sortOrder: "asc" } },
      awards: { orderBy: { year: "desc" } },
    },
  });
}

export function mapPlayerCard(p: {
  slug: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  position: string | null;
  heightCm: number | null;
  jerseyNumber: number | null;
  categoryDivision: string | null;
  genderDivision: string | null;
  team?: {
    name: string;
    categoryDivision?: string;
    genderDivision?: string;
  } | null;
}) {
  const categoryDivision =
    p.team?.categoryDivision ?? p.categoryDivision ?? null;
  const genderDivision = p.team?.genderDivision ?? p.genderDivision ?? null;
  return {
    slug: p.slug,
    firstName: p.firstName,
    lastName: p.lastName,
    photoUrl: p.photoUrl,
    teamName: p.team?.name ?? null,
    position: p.position,
    heightCm: p.heightCm,
    jerseyNumber: p.jerseyNumber,
    category: categoryDivision,
    genderDivision,
  };
}

function compareTeamRecords(
  a: { wins: number; losses: number; name: string },
  b: { wins: number; losses: number; name: string }
): number {
  if (b.wins !== a.wins) return b.wins - a.wins;
  if (a.losses !== b.losses) return a.losses - b.losses;
  const aPlayed = a.wins + a.losses;
  const bPlayed = b.wins + b.losses;
  if (aPlayed > 0 && bPlayed > 0) {
    const aPct = a.wins / aPlayed;
    const bPct = b.wins / bPlayed;
    if (bPct !== aPct) return bPct - aPct;
  }
  return a.name.localeCompare(b.name, "es");
}

/** Top teams by W–L for home podium (best record first). */
export async function getFeaturedTeams(limit = 8) {
  const { getTeamRecordsMap } = await import("./team-stats");
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const records = await getTeamRecordsMap(teams.map((t) => t.id));
  return teams
    .map((t) => {
      const r = records.get(t.id)!;
      return { ...t, wins: r.wins, losses: r.losses };
    })
    .sort((a, b) => compareTeamRecords(a, b))
    .slice(0, limit);
}

export async function getTeams(filters?: {
  genderDivision?: string;
  categoryDivision?: string;
}) {
  return prisma.team.findMany({
    where: {
      ...(filters?.genderDivision && { genderDivision: filters.genderDivision }),
      ...(filters?.categoryDivision && {
        categoryDivision: filters.categoryDivision,
      }),
    },
    orderBy: { name: "asc" },
  });
}

export async function getTeamBySlug(slug: string) {
  return prisma.team.findUnique({
    where: { slug },
    include: {
      players: { orderBy: { jerseyNumber: "asc" } },
      homeGames: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { scheduledAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function getActiveTournament() {
  return prisma.tournament.findFirst({
    where: { active: true },
    orderBy: { startDate: "asc" },
  });
}

export async function getSiteStats() {
  const { getSiteConfig } = await import("./site-config");
  const [players, teams, games, config] = await Promise.all([
    prisma.player.count(),
    prisma.team.count(),
    prisma.game.count(),
    getSiteConfig(),
  ]);
  return {
    players,
    teams,
    games,
    scholarships: config.scholarshipsCount ?? 0,
  };
}

export async function getSponsors() {
  return prisma.sponsor.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getSponsorsForHome() {
  const { getSiteConfig } = await import("./site-config");
  const [sponsors, config] = await Promise.all([getSponsors(), getSiteConfig()]);
  const limit = Math.max(1, config.sponsorDisplaySlots ?? 10);
  return sponsors.slice(0, limit);
}

export async function getRecruitersForTorneo() {
  const { getSiteConfig } = await import("./site-config");
  const [recruiters, config] = await Promise.all([
    getRecruiters(),
    getSiteConfig(),
  ]);
  const limit = Math.max(1, config.recruiterDisplaySlots ?? 5);
  return recruiters.slice(0, limit);
}

export async function getRecruiters() {
  return prisma.recruiter.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getFeaturedMedia(limit = 6) {
  return prisma.mediaItem.findMany({
    where: { featured: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getAllMedia(type?: string) {
  return prisma.mediaItem.findMany({
    where: type ? { type } : undefined,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getGames(filters?: {
  genderDivision?: string;
  categoryDivision?: string;
  status?: string;
}) {
  return prisma.game.findMany({
    where: {
      ...(filters?.genderDivision && { genderDivision: filters.genderDivision }),
      ...(filters?.categoryDivision && {
        categoryDivision: filters.categoryDivision,
      }),
      ...(filters?.status && { status: filters.status }),
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getGamesByDivision() {
  const games = await getGames();
  const config = await getSiteConfig();
  const groups = new Map<string, typeof games>();

  for (const g of games) {
    const key = divisionLabel(g.categoryDivision, g.genderDivision);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }

  const ordered: { label: string; games: typeof games }[] = [];
  for (const div of getDivisionGroups(config)) {
    if (groups.has(div.label)) {
      ordered.push({ label: div.label, games: groups.get(div.label)! });
    }
  }
  for (const [label, list] of groups) {
    if (!ordered.some((o) => o.label === label)) {
      ordered.push({ label, games: list });
    }
  }
  return ordered;
}

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "main" } });
}

export async function getTeamsList() {
  return prisma.team.findMany({ orderBy: { name: "asc" } });
}

export async function getStatLeaderPlayers() {
  const config = await getSiteConfig();
  const slots = config.statLeaders;
  const slugs = slots.map((s) => s.playerSlug).filter(Boolean) as string[];
  const players = slugs.length
    ? await prisma.player.findMany({
        where: { slug: { in: slugs } },
        include: { team: true },
      })
    : [];
  const bySlug = new Map(players.map((p) => [p.slug, p]));
  return { config, slots, bySlug };
}
