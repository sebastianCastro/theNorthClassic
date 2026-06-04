"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import {
  readWorkbook,
  getSheetRows,
  parseTeamRow,
  parseBasicSettingsSheet,
} from "@/lib/excel-import";
import {
  parsePlayerRow,
  playerCsvToDbFields,
  parseBirthdate,
  isEmptyCsvRow,
} from "@/lib/csv-import";
import { saveSiteConfig, type SiteConfig } from "@/lib/site-config";
import { syncStandingsFromGames } from "@/lib/team-stats";
import { linkPlayersToTeamsByImportName } from "./actions";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function importTournamentWorkbook(buffer: ArrayBuffer) {
  await requireAdmin();

  const wb = readWorkbook(buffer);
  const results: {
    teams: { created: number; updated: number; errors: { row: number; message: string }[] };
    players: { created: number; updated: number; errors: { row: number; message: string }[] };
    settings: { ok: boolean; message: string };
  } = {
    teams: { created: 0, updated: 0, errors: [] },
    players: { created: 0, updated: 0, errors: [] },
    settings: { ok: false, message: "" },
  };

  const teamRows = getSheetRows(wb, ["Teams", "Equipos", "teams", "equipos"]);
  for (let i = 0; i < teamRows.length; i++) {
    const parsed = parseTeamRow(teamRows[i], i + 2);
    if ("skip" in parsed && parsed.skip) continue;
    if ("error" in parsed && parsed.error) {
      results.teams.errors.push(parsed.error);
      continue;
    }
    if (!parsed.data) continue;
    const slug = slugify(parsed.data.name);
    const payload = {
      name: parsed.data.name,
      slug,
      genderDivision: parsed.data.genderDivision,
      categoryDivision: parsed.data.categoryDivision,
      city: parsed.data.city,
      logoUrl: parsed.data.logoUrl,
      coaches: parsed.data.coaches,
      description: parsed.data.description,
    };
    const existing = await prisma.team.findUnique({ where: { slug } });
    if (existing) {
      await prisma.team.update({ where: { slug }, data: payload });
      results.teams.updated++;
    } else {
      await prisma.team.create({ data: payload });
      results.teams.created++;
    }
  }

  const settingsRows = getSheetRows(wb, [
    "Basic Settings",
    "Configuracion",
    "Settings",
    "Ajustes",
  ]);
  if (settingsRows.length > 0) {
    const { config, orgFields, sponsorRows } =
      parseBasicSettingsSheet(settingsRows);
    await saveSiteConfig(config);
    await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: {
        organizationName: orgFields.organizationName,
        contactEmail: orgFields.contactEmail,
        contactPhone: orgFields.contactPhone,
        contactWhatsapp: orgFields.contactWhatsapp,
        address: orgFields.address,
        socialInstagram: orgFields.socialInstagram,
        socialFacebook: orgFields.socialFacebook,
        socialTiktok: orgFields.socialTiktok,
        socialYoutube: orgFields.socialYoutube,
      },
      create: {
        id: "main",
        configJson: JSON.stringify(config),
        ...orgFields,
      },
    });
    for (let i = 0; i < sponsorRows.length; i++) {
      const s = sponsorRows[i];
      const slug = slugify(s.name);
      await prisma.sponsor.upsert({
        where: { slug },
        update: {
          name: s.name,
          logoUrl: s.logoUrl || null,
          websiteUrl: s.website,
          sortOrder: i,
        },
        create: {
          name: s.name,
          slug,
          logoUrl: s.logoUrl || null,
          websiteUrl: s.website,
          sortOrder: i,
        },
      });
    }
    if (config.tournament.name && config.tournament.startDate) {
      const active = await prisma.tournament.findFirst({ where: { active: true } });
      const tData = {
        name: config.tournament.name,
        edition: config.tournament.edition,
        description: config.tournament.description,
        location: config.tournament.location || "México",
        venue: config.tournament.venue,
        startDate: new Date(config.tournament.startDate!),
        endDate: new Date(
          config.tournament.endDate || config.tournament.startDate!
        ),
        rules: config.rules.join("\n"),
        faq: JSON.stringify(config.faqs),
        divisions: JSON.stringify({
          genderDivisions: config.genderDivisions,
          categoryDivisions: config.categoryDivisions,
        }),
        active: true,
      };
      if (active) {
        await prisma.tournament.update({ where: { id: active.id }, data: tData });
      } else {
        await prisma.tournament.create({ data: tData });
      }
    }
    results.settings = { ok: true, message: "Configuración actualizada" };
  } else {
    results.settings = { ok: true, message: "Hoja de configuración no encontrada (opcional)" };
  }

  const playerRows = getSheetRows(wb, ["Players", "Jugadores", "players", "jugadores"]);
  const teams = await prisma.team.findMany();
  const teamSlugByName = new Map(teams.map((t) => [slugify(t.name), t.slug]));
  const teamBySlug = new Map(teams.map((t) => [t.slug, t]));

  for (let i = 0; i < playerRows.length; i++) {
    if (isEmptyCsvRow(playerRows[i])) continue;
    const result = parsePlayerRow(playerRows[i], i + 2);
    if (result.skip) continue;
    if (result.error) {
      results.players.errors.push(result.error);
      continue;
    }
    if (!result.data) continue;

    const fields = playerCsvToDbFields(result.data, teamSlugByName);
    let teamId: string | null = null;
    if (fields.teamSlug) {
      teamId = teamBySlug.get(fields.teamSlug)?.id ?? null;
    }
    const team = teamId ? teams.find((t) => t.id === teamId) : null;

    const payload = {
      firstName: fields.firstName,
      lastName: fields.lastName,
      jerseyNumber: fields.jerseyNumber,
      position: fields.position,
      heightCm: fields.heightCm,
      weightKg: fields.weightKg,
      wingspanCm: fields.wingspanCm,
      age: fields.age,
      birthdate: parseBirthdate(result.data.nacimiento),
      biography: fields.biography,
      achievements: JSON.stringify(fields.achievements),
      highlightUrl: fields.highlightUrl,
      photoUrl: fields.photoUrl,
      instagram: fields.instagram,
      tiktok: fields.tiktok,
      youtube: fields.youtube,
      teamId,
      importTeamName: result.data.equipo?.trim() || null,
      genderDivision: team?.genderDivision ?? null,
      categoryDivision: team?.categoryDivision ?? fields.category ?? null,
      featured: false,
    };

    const existing = await prisma.player.findUnique({ where: { slug: fields.slug } });
    try {
      if (existing) {
        await prisma.player.update({ where: { slug: fields.slug }, data: payload });
        results.players.updated++;
      } else {
        await prisma.player.create({ data: { slug: fields.slug, ...payload } });
        results.players.created++;
      }
    } catch (e) {
      results.players.errors.push({
        row: i + 2,
        message: (e as Error).message,
      });
    }
  }

  const { getSiteConfig } = await import("@/lib/site-config");
  const siteConfig = await getSiteConfig();
  if (siteConfig.featuredPlayerSlugs.length) {
    await prisma.player.updateMany({ data: { featured: false } });
    await prisma.player.updateMany({
      where: { slug: { in: siteConfig.featuredPlayerSlugs } },
      data: { featured: true },
    });
  }

  await linkPlayersToTeamsByImportName();
  await syncStandingsFromGames();

  revalidatePath("/", "layout");

  return results;
}
