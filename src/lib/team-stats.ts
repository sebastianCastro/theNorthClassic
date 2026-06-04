import { prisma } from "./prisma";

export type TeamRecord = {
  wins: number;
  losses: number;
  played: number;
  pointsFor: number;
  pointsAgainst: number;
};

export async function getTeamRecord(teamId: string): Promise<TeamRecord> {
  const games = await prisma.game.findMany({
    where: {
      status: "FINAL",
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    select: {
      homeTeamId: true,
      awayTeamId: true,
      homeScore: true,
      awayScore: true,
    },
  });

  let wins = 0;
  let losses = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  for (const g of games) {
    if (g.homeScore == null || g.awayScore == null) continue;
    const isHome = g.homeTeamId === teamId;
    const scored = isHome ? g.homeScore : g.awayScore;
    const allowed = isHome ? g.awayScore : g.homeScore;
    pointsFor += scored;
    pointsAgainst += allowed;
    if (scored > allowed) wins++;
    else if (scored < allowed) losses++;
  }

  return {
    wins,
    losses,
    played: wins + losses,
    pointsFor,
    pointsAgainst,
  };
}

export async function getTeamRecordsMap(
  teamIds: string[]
): Promise<Map<string, TeamRecord>> {
  const map = new Map<string, TeamRecord>();
  await Promise.all(
    teamIds.map(async (id) => {
      map.set(id, await getTeamRecord(id));
    })
  );
  return map;
}

/** Sincroniza tabla Standing desde partidos FINAL (opcional para rankings) */
export async function syncStandingsFromGames() {
  const teams = await prisma.team.findMany();
  for (const team of teams) {
    const record = await getTeamRecord(team.id);
    const existing = await prisma.standing.findFirst({
      where: {
        teamId: team.id,
        category: `${team.categoryDivision}|${team.genderDivision}`,
      },
    });
    const data = {
      teamId: team.id,
      category: `${team.categoryDivision}|${team.genderDivision}`,
      wins: record.wins,
      losses: record.losses,
      pointsFor: record.pointsFor,
      pointsAgainst: record.pointsAgainst,
      rank: 0,
    };
    if (existing) {
      await prisma.standing.update({ where: { id: existing.id }, data });
    } else {
      await prisma.standing.create({ data });
    }
  }
}
