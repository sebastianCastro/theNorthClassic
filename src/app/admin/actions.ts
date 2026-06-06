"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  parsePlayerRow,
  playerCsvToDbFields,
  parseBirthdate,
  isEmptyCsvRow,
  normalizeCsvRow,
  normalizeGenderDivision,
} from "@/lib/csv-import";
import { parseScoreField, resolveGameStatusFromScores } from "@/lib/game-scores";
import { syncStandingsFromGames } from "@/lib/team-stats";
import {
  deleteUploadedFile,
  isLocalUpload,
  resolvePhotoFromForm,
  saveUploadedImage,
} from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

function revalidateHomeAndTeams(teamSlug?: string | null) {
  revalidatePath("/", "page");
  revalidatePath("/equipos", "page");
  if (teamSlug) {
    revalidatePath(`/equipos/${teamSlug}`, "page");
  }
}

function revalidateAfterGameChange() {
  revalidateHomeAndTeams();
  revalidatePath("/partidos", "page");
}
import Papa from "papaparse";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function importPlayersCsv(csvText: string) {
  await requireAdmin();

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const teams = await prisma.team.findMany();
  const teamSlugByName = new Map(
    teams.map((t) => [slugify(t.name), t.slug])
  );
  const teamBySlug = new Map(teams.map((t) => [t.slug, t]));

  const errors: { row: number; message: string }[] = [];
  const warnings: { row: number; message: string }[] = [];
  const created: string[] = [];
  const updated: string[] = [];
  const duplicates: number[] = [];

  const rows = parsed.data ?? [];

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 2;
    const raw = rows[i];

    if (isEmptyCsvRow(raw)) continue;

    const result = parsePlayerRow(raw, rowIndex);
    if (result.skip) continue;
    if (result.error) {
      errors.push(result.error);
      continue;
    }
    if (!result.data) continue;

    const fields = playerCsvToDbFields(result.data, teamSlugByName);
    const existing = await prisma.player.findUnique({
      where: { slug: fields.slug },
    });

    if (existing) {
      duplicates.push(rowIndex);
    }

    let teamId: string | null = null;
    let teamMeta: { genderDivision: string; categoryDivision: string } | null =
      null;
    if (fields.teamSlug && result.data.equipo) {
      const team = teamBySlug.get(fields.teamSlug);
      if (team) {
        teamId = team.id;
        teamMeta = {
          genderDivision: team.genderDivision,
          categoryDivision: team.categoryDivision,
        };
      } else {
        warnings.push({
          row: rowIndex,
          message: `Equipo "${result.data.equipo}" no encontrado — importado sin equipo`,
        });
      }
    }

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
      genderDivision: teamMeta?.genderDivision ?? null,
      categoryDivision: teamMeta?.categoryDivision ?? null,
    };

    try {
      if (existing) {
        await prisma.player.update({
          where: { slug: fields.slug },
          data: payload,
        });
        updated.push(fields.slug);
      } else {
        await prisma.player.create({
          data: { slug: fields.slug, ...payload },
        });
        created.push(fields.slug);
      }
    } catch (e) {
      errors.push({
        row: rowIndex,
        message: (e as Error).message || "Error al guardar en base de datos",
      });
    }
  }

  const relinked = await linkPlayersToTeamsByImportName();

  revalidatePath("/jugadores", "page");
  revalidatePath("/", "page");
  revalidatePath("/admin");

  return {
    success: created.length + updated.length > 0,
    created: created.length,
    updated: updated.length,
    duplicates,
    errors,
    warnings: [
      ...warnings,
      ...(relinked > 0
        ? [
            {
              row: 0,
              message: `${relinked} jugador(es) vinculados a equipos existentes`,
            },
          ]
        : []),
    ],
    total: rows.filter((r) => !isEmptyCsvRow(r)).length,
  };
}

export async function importTeamsCsv(csvText: string) {
  await requireAdmin();

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let updated = 0;

  for (let i = 0; i < (parsed.data?.length ?? 0); i++) {
    const raw = parsed.data![i];
    if (isEmptyCsvRow(raw)) continue;

    const row = normalizeCsvRow(raw);
    const name = (row.nombre || row.name || "").trim();
    const genderDivision = normalizeGenderDivision(
      row.genero || row.gender || row.genderdivision || ""
    );
    const categoryDivision = (
      row.categoriadivision ||
      row.categorydivision ||
      row.categoria ||
      ""
    ).trim();

    if (!name) {
      errors.push({ row: i + 2, message: "Falta el nombre del equipo" });
      continue;
    }
    if (!genderDivision) {
      errors.push({ row: i + 2, message: "Falta género (Varonil, Femenil)" });
      continue;
    }
    if (!categoryDivision) {
      errors.push({ row: i + 2, message: "Falta categoría (ej. 2007-2009)" });
      continue;
    }

    const slug = slugify(name);
    const data = {
      name,
      slug,
      genderDivision,
      categoryDivision,
      logoUrl: row.logo || null,
      coaches: row.entrenadores || row.coaches,
      description: row.descripcion || row.description,
    };

    const existing = await prisma.team.findUnique({ where: { slug } });
    if (existing) {
      await prisma.team.update({ where: { slug }, data });
      updated++;
    } else {
      await prisma.team.create({ data });
      created++;
    }
  }

  revalidateHomeAndTeams();
  revalidatePath("/admin");

  const relinked = await linkPlayersToTeamsByImportName();

  return {
    success: created + updated > 0,
    created,
    updated,
    errors,
    warnings: relinked > 0
      ? [
          {
            row: 0,
            message: `${relinked} jugador(es) asignados a roster por nombre de equipo`,
          },
        ]
      : [],
  };
}

/** Vincula jugadores usando la columna "equipo" guardada al importar jugadores */
export async function linkPlayersToTeamsByImportName() {
  await requireAdmin();
  const teams = await prisma.team.findMany();
  const teamBySlug = new Map(teams.map((t) => [slugify(t.name), t.id]));

  const players = await prisma.player.findMany({
    where: {
      importTeamName: { not: null },
    },
    select: { id: true, importTeamName: true, teamId: true },
  });

  let count = 0;
  for (const p of players) {
    if (!p.importTeamName) continue;
    const teamId = teamBySlug.get(slugify(p.importTeamName));
    if (teamId && p.teamId !== teamId) {
      const team = teams.find((t) => t.id === teamId);
      await prisma.player.update({
        where: { id: p.id },
        data: {
          teamId,
          genderDivision: team?.genderDivision,
          categoryDivision: team?.categoryDivision,
        },
      });
      count++;
    }
  }
  if (count > 0) {
    revalidatePath("/jugadores", "page");
    revalidatePath("/equipos", "page");
  }
  return count;
}

export async function deleteTeam(id: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({
    where: { id },
    select: { slug: true },
  });
  await prisma.player.updateMany({ where: { teamId: id }, data: { teamId: null } });
  await prisma.team.delete({ where: { id } });
  revalidateHomeAndTeams(team?.slug);
  revalidatePath("/admin/equipos");
}

export async function deletePlayer(id: string) {
  await requireAdmin();
  await prisma.player.delete({ where: { id } });
  revalidatePath("/jugadores", "page");
  revalidatePath("/admin/jugadores");
}

export async function updateGameScore(id: string, formData: FormData) {
  await requireAdmin();
  const homeScore = parseScoreField(formData.get("homeScore"));
  const awayScore = parseScoreField(formData.get("awayScore"));
  const status = resolveGameStatusFromScores(homeScore, awayScore);

  await prisma.game.update({
    where: { id },
    data: {
      homeScore,
      awayScore,
      status,
    },
  });

  await syncStandingsFromGames();
  revalidateAfterGameChange();
  revalidatePath("/admin/partidos");
}

export async function deleteGame(id: string) {
  await requireAdmin();
  await prisma.game.delete({ where: { id } });
  await syncStandingsFromGames();
  revalidateAfterGameChange();
  revalidatePath("/admin/partidos");
}

export async function upsertGame(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  const homeTeamId = String(formData.get("homeTeamId"));
  const awayTeamId = String(formData.get("awayTeamId"));
  const scheduledAt = new Date(String(formData.get("scheduledAt")));
  const venue =
    (formData.get("venue") as string)?.trim() ||
    "Gimnasio del Instituto La Salle Chihuahua";
  const roundPreset = String(formData.get("roundPreset") || "");
  const roundCustom = String(formData.get("roundCustom") || "");
  const round =
    roundPreset === "Personalizada"
      ? roundCustom || null
      : roundPreset || null;
  const status = (formData.get("status") as string) || "SCHEDULED";
  const homeScoreRaw = formData.get("homeScore");
  const awayScoreRaw = formData.get("awayScore");
  const homeScore =
    homeScoreRaw !== null && homeScoreRaw !== ""
      ? parseInt(String(homeScoreRaw), 10)
      : null;
  const awayScore =
    awayScoreRaw !== null && awayScoreRaw !== ""
      ? parseInt(String(awayScoreRaw), 10)
      : null;

  const homeTeam = await prisma.team.findUnique({ where: { id: homeTeamId } });
  if (!homeTeam) throw new Error("Equipo local no encontrado");

  const data = {
    homeTeamId,
    awayTeamId,
    scheduledAt,
    venue,
    genderDivision: homeTeam.genderDivision,
    categoryDivision: homeTeam.categoryDivision,
    round,
    status,
    homeScore,
    awayScore,
  };

  if (id) {
    await prisma.game.update({ where: { id }, data });
  } else {
    await prisma.game.create({ data });
  }

  await syncStandingsFromGames();
  revalidateAfterGameChange();
  revalidatePath("/admin/partidos");
}

export async function deleteMedia(id: string) {
  await requireAdmin();
  await prisma.mediaItem.delete({ where: { id } });
  revalidatePath("/media", "page");
  revalidatePath("/admin/media");
}

export async function updateTeam(id: string, formData: FormData) {
  await requireAdmin();
  const existing = await prisma.team.findUnique({
    where: { id },
    select: { slug: true },
  });
  await prisma.team.update({
    where: { id },
    data: {
      name: String(formData.get("name")),
      logoUrl: (formData.get("logoUrl") as string) || null,
      genderDivision: String(formData.get("genderDivision")),
      categoryDivision: String(formData.get("categoryDivision")),
      coaches: (formData.get("coaches") as string) || null,
      description: (formData.get("description") as string) || null,
    },
  });
  revalidateHomeAndTeams(existing?.slug);
  revalidatePath("/admin/equipos");
}

export async function updatePlayer(id: string, formData: FormData) {
  await requireAdmin();
  const existing = await prisma.player.findUnique({ where: { id } });
  if (!existing) throw new Error("Jugador no encontrado");

  const teamId = (formData.get("teamId") as string) || null;
  let genderDivision: string | null = null;
  let categoryDivision: string | null = null;
  if (teamId) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    genderDivision = team?.genderDivision ?? null;
    categoryDivision = team?.categoryDivision ?? null;
  }

  const photoUrl = await resolvePhotoFromForm(formData, {
    entityId: id,
    folder: "players",
    existingUrl: existing.photoUrl,
    allowExternalUrl: true,
  });

  await prisma.player.update({
    where: { id },
    data: {
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      photoUrl,
      jerseyNumber: formData.get("jerseyNumber")
        ? parseInt(String(formData.get("jerseyNumber")), 10)
        : null,
      teamId,
      genderDivision,
      categoryDivision,
    },
  });
  revalidatePath("/jugadores", "page");
  revalidatePath("/admin/jugadores");
  revalidatePath("/", "page");
}

export async function saveSponsorDisplaySlots(count: number) {
  await requireAdmin();
  const { getSiteConfig, saveSiteConfig } = await import("@/lib/site-config");
  const config = await getSiteConfig();
  config.sponsorDisplaySlots = Math.min(30, Math.max(1, count));
  await saveSiteConfig(config);
  revalidatePath("/", "page");
  revalidatePath("/admin/patrocinadores");
}

export async function saveRecruiterDisplaySlots(count: number) {
  await requireAdmin();
  const { getSiteConfig, saveSiteConfig } = await import("@/lib/site-config");
  const config = await getSiteConfig();
  config.recruiterDisplaySlots = Math.min(20, Math.max(1, count));
  await saveSiteConfig(config);
  revalidatePath("/torneo", "page");
  revalidatePath("/admin/reclutadores");
}

export async function saveFaqs(faqs: { q: string; a: string }[]) {
  await requireAdmin();
  const { getSiteConfig, saveSiteConfig } = await import("@/lib/site-config");
  const config = await getSiteConfig();
  config.faqs = faqs
    .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
    .filter((f) => f.q.length > 0);

  await saveSiteConfig(config);

  const tournament = await prisma.tournament.findFirst({
    where: { active: true },
  });
  if (tournament) {
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { faq: JSON.stringify(config.faqs) },
    });
  }

  revalidatePath("/torneo", "page");
  revalidatePath("/admin/faqs");
}

export async function saveScholarshipsCount(count: number) {
  await requireAdmin();
  const { getSiteConfig, saveSiteConfig } = await import("@/lib/site-config");
  const config = await getSiteConfig();
  config.scholarshipsCount = Math.max(0, count);
  await saveSiteConfig(config);
  revalidatePath("/", "page");
}

export async function createEmptySponsor() {
  await requireAdmin();
  const count = await prisma.sponsor.count();
  await prisma.sponsor.create({
    data: {
      name: `Patrocinador ${count + 1}`,
      slug: `patrocinador-${Date.now()}`,
      logoUrl: null,
      websiteUrl: null,
      sortOrder: count,
    },
  });
  revalidatePath("/", "page");
  revalidatePath("/admin/patrocinadores");
}

export async function createEmptyRecruiter() {
  await requireAdmin();
  const count = await prisma.recruiter.count();
  await prisma.recruiter.create({
    data: {
      name: `Reclutador ${count + 1}`,
      teamName: "Programa universitario",
      description: "Descripción del reclutador.",
      photoUrl: null,
      sortOrder: count,
    },
  });
  revalidatePath("/torneo", "page");
  revalidatePath("/admin/reclutadores");
}

export async function upsertSponsor(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  if (!id) throw new Error("ID de patrocinador requerido");

  const existing = await prisma.sponsor.findUnique({ where: { id } });
  if (!existing) throw new Error("Patrocinador no encontrado");

  const name = String(formData.get("name")).trim();
  const slug = slugify(name);
  const removeLogo = formData.get("removeLogo") === "on";
  let logoUrl = existing.logoUrl;

  if (removeLogo) {
    if (isLocalUpload(logoUrl)) await deleteUploadedFile(logoUrl);
    logoUrl = null;
  } else {
    logoUrl = await resolvePhotoFromForm(formData, {
      entityId: id,
      folder: "sponsors",
      existingUrl: existing.logoUrl,
      fileField: "logoFile",
      urlField: "logoUrl",
      allowExternalUrl: true,
    });
  }

  await prisma.sponsor.update({
    where: { id },
    data: {
      name,
      slug,
      logoUrl,
      websiteUrl: (formData.get("websiteUrl") as string)?.trim() || null,
      sortOrder: parseInt(String(formData.get("sortOrder") || "0"), 10),
    },
  });
  revalidatePath("/", "page");
  revalidatePath("/admin/patrocinadores");
}

export async function deleteSponsor(id: string) {
  await requireAdmin();
  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (sponsor?.logoUrl && isLocalUpload(sponsor.logoUrl)) {
    await deleteUploadedFile(sponsor.logoUrl);
  }
  await prisma.sponsor.delete({ where: { id } });
  revalidatePath("/", "page");
  revalidatePath("/admin/patrocinadores");
}

export async function upsertRecruiter(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  if (!id) throw new Error("ID de reclutador requerido");

  const existing = await prisma.recruiter.findUnique({ where: { id } });
  if (!existing) throw new Error("Reclutador no encontrado");

  const file = formData.get("photoFile") as File | null;
  const removePhoto = formData.get("removePhoto") === "on";
  let photoUrl = existing.photoUrl;

  if (removePhoto) {
    if (isLocalUpload(photoUrl)) await deleteUploadedFile(photoUrl);
    photoUrl = null;
  } else if (file?.size) {
    if (isLocalUpload(photoUrl)) await deleteUploadedFile(photoUrl);
    photoUrl = await saveUploadedImage(file, "recruiters", id);
  }

  await prisma.recruiter.update({
    where: { id },
    data: {
      name: String(formData.get("name")).trim(),
      teamName: String(formData.get("teamName")).trim(),
      description: String(formData.get("description")).trim(),
      photoUrl,
      sortOrder: parseInt(String(formData.get("sortOrder") || "0"), 10),
    },
  });
  revalidatePath("/torneo", "page");
  revalidatePath("/admin/reclutadores");
}

export async function deleteRecruiter(id: string) {
  await requireAdmin();
  const recruiter = await prisma.recruiter.findUnique({ where: { id } });
  if (recruiter?.photoUrl && isLocalUpload(recruiter.photoUrl)) {
    await deleteUploadedFile(recruiter.photoUrl);
  }
  await prisma.recruiter.delete({ where: { id } });
  revalidatePath("/torneo", "page");
  revalidatePath("/admin/reclutadores");
}

export async function saveStatLeaders(
  leaders: {
    categoryDivision: string;
    genderDivision: string;
    statKey: string;
    playerSlug: string;
  }[]
) {
  await requireAdmin();
  const { getSiteConfig, saveSiteConfig } = await import("@/lib/site-config");
  const config = await getSiteConfig();
  const { STAT_LEADER_KEYS } = await import("@/lib/site-config");
  config.statLeaders = leaders
    .filter((l) => l.playerSlug)
    .map((l) => ({
      categoryDivision: l.categoryDivision,
      genderDivision: l.genderDivision,
      statKey: l.statKey,
      statLabel:
        STAT_LEADER_KEYS.find((s) => s.key === l.statKey)?.label ?? l.statKey,
      playerSlug: l.playerSlug,
    }));
  await saveSiteConfig(config);
  revalidatePath("/", "page");
  revalidatePath("/admin/lideres");
}

export async function createMedia(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title"));
  const slug = slugify(title);
  const type = String(formData.get("type") || "noticia");
  const embedUrl = (formData.get("embedUrl") as string) || null;
  const url = (formData.get("url") as string) || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;
  const description = (formData.get("description") as string) || null;

  await prisma.mediaItem.create({
    data: {
      title,
      slug: `${slug}-${Date.now()}`,
      type,
      url: type === "instagram" ? embedUrl : url,
      embedUrl: type === "instagram" ? embedUrl : null,
      thumbnailUrl: type === "instagram" ? null : thumbnailUrl,
      description: type === "instagram" ? null : description,
    },
  });

  revalidatePath("/media", "page");
  revalidatePath("/admin/media");
}
