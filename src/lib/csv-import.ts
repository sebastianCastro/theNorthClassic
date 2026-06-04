import { z } from "zod";
import { slugify } from "./utils";

const positionMap: Record<string, string> = {
  base: "PG",
  pg: "PG",
  escolta: "SG",
  sg: "SG",
  alero: "SF",
  sf: "SF",
  "ala-pivot": "PF",
  "ala-pívot": "PF",
  pf: "PF",
  pivot: "C",
  pívot: "C",
  c: "C",
};

const categoryMap: Record<string, string> = {
  u15: "U15",
  "sub-15": "U15",
  u17: "U17",
  "sub-17": "U17",
  u19: "U19",
  "sub-19": "U19",
  premier: "PREMIER",
};

export const playerCsvSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  apellido: z.string().optional(),
  equipo: z.string().optional(),
  numero: z.string().optional(),
  posicion: z.string().optional(),
  altura: z.string().optional(),
  peso: z.string().optional(),
  categoria: z.string().optional(),
  biografia: z.string().optional(),
  nacimiento: z.string().optional(),
  edad: z.string().optional(),
  envergadura: z.string().optional(),
  logro1: z.string().optional(),
  logro2: z.string().optional(),
  logro3: z.string().optional(),
  logro4: z.string().optional(),
  logro5: z.string().optional(),
  video: z.string().optional(),
  foto: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
});

export function normalizeGenderDivision(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const map: Record<string, string> = {
    varonil: "Varonil",
    masculin: "Varonil",
    masculino: "Varonil",
    male: "Varonil",
    femenil: "Femenil",
    femenino: "Femenil",
    female: "Femenil",
  };
  return map[key] ?? trimmed;
}

/** Legacy U15 etc. or free-text category division */
export function normalizeTeamCategory(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const map: Record<string, string> = {
    u15: "U15",
    u17: "U17",
    u19: "U19",
    premier: "PREMIER",
  };
  return map[key] ?? trimmed;
}

export const teamCsvSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  genero: z.string().min(1, "Género requerido (Varonil, Femenil)"),
  categoriadivision: z.string().min(1, "Categoría requerida (ej. 2007-2009)"),
  logo: z.string().optional(),
  entrenadores: z.string().optional(),
  descripcion: z.string().optional(),
});

export const scheduleCsvSchema = z.object({
  fecha: z.string().min(1, "Fecha requerida"),
  hora: z.string().optional(),
  local: z.string().min(1, "Equipo local requerido"),
  visitante: z.string().min(1, "Equipo visitante requerido"),
  sede: z.string().optional(),
  categoria: z.string().optional(),
  ronda: z.string().optional(),
});

export type ImportRowError = {
  row: number;
  field?: string;
  message: string;
};

export type ImportPreview<T> = {
  valid: T[];
  errors: ImportRowError[];
  duplicates: number[];
};

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

export function normalizeCsvRow(
  row: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = normalizeKey(k.replace(/^\uFEFF/, ""));
    out[key] = (v ?? "").trim();
  }
  return out;
}

export function isEmptyCsvRow(raw: Record<string, string>): boolean {
  return Object.values(raw).every((v) => !(v ?? "").trim());
}

function resolvePlayerName(row: Record<string, string>) {
  const fullName =
    row.nombre ||
    row.name ||
    row.nombrecompleto ||
    row.nombreyapellido ||
    row.nombredeljugador ||
    row.jugador ||
    "";
  const parts = fullName.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last =
    row.apellido ||
    row.lastname ||
    row.apellidos ||
    parts.slice(1).join(" ") ||
    "";
  return { first, last, fullName: fullName.trim() };
}

export function parseBirthdate(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function parsePlayerRow(
  raw: Record<string, string>,
  rowIndex: number
): {
  data?: z.infer<typeof playerCsvSchema>;
  error?: ImportRowError;
  skip?: boolean;
} {
  if (isEmptyCsvRow(raw)) {
    return { skip: true };
  }

  const row = normalizeCsvRow(raw);
  const { first, last, fullName } = resolvePlayerName(row);

  if (!fullName && !first) {
    return {
      error: {
        row: rowIndex,
        message:
          'Falta el nombre. Usa columna "nombre", "nombre completo" o "Nombre"',
      },
    };
  }

  const parsed = playerCsvSchema.safeParse({
    nombre: first || fullName,
    apellido: last,
    equipo: row.equipo || row.team || row.club || row.nombreequipo,
    numero:
      row.numero ||
      row.jersey ||
      row.dorsal ||
      row.numerodejersey ||
      row.numerojersey,
    posicion: row.posicion || row.position,
    altura: row.altura || row.height,
    peso: row.peso || row.weight,
    categoria: row.categoria || row.category,
    biografia: row.biografia || row.bio,
    nacimiento: row.nacimiento || row.birthdate || row.fechanacimiento,
    edad: row.edad || row.age,
    envergadura: row.envergadura || row.wingspan,
    logro1:
      row.logro1 ||
      row.achievement1 ||
      row.logro ||
      row.logros ||
      row.primerlogro,
    logro2: row.logro2 || row.achievement2 || row.segundologro,
    logro3: row.logro3 || row.achievement3 || row.tercerlogro,
    logro4: row.logro4 || row.achievement4 || row.cuartologro,
    logro5: row.logro5 || row.achievement5 || row.quintologro,
    video:
      row.video ||
      row.highlight ||
      row.highlighturl ||
      row.linkdevideo ||
      row.urldevideo,
    foto: row.foto || row.photo || row.fotourl || row.fotodeljugador,
    instagram: row.instagram,
    tiktok: row.tiktok,
    youtube: row.youtube,
  });

  if (!parsed.success) {
    return {
      error: {
        row: rowIndex,
        message: parsed.error.issues[0]?.message ?? "Fila inválida",
      },
    };
  }
  return { data: parsed.data };
}

export function playerCsvToDbFields(
  data: z.infer<typeof playerCsvSchema>,
  teamSlugByName: Map<string, string>
) {
  const lastName = data.apellido ?? "";
  const slug = slugify(
    lastName && lastName !== "—"
      ? `${data.nombre}-${lastName}`
      : `${data.nombre} ${lastName}`.trim()
  );
  const achievements = [data.logro1, data.logro2, data.logro3, data.logro4, data.logro5].filter(
    Boolean
  ) as string[];

  const posKey = (data.posicion ?? "").toLowerCase();
  const position = positionMap[posKey] ?? undefined;
  const catKey = (data.categoria ?? "").toLowerCase();
  const category = categoryMap[catKey] ?? undefined;

  const heightCm = data.altura ? parseInt(data.altura.replace(/\D/g, ""), 10) : undefined;
  const weightKg = data.peso ? parseInt(data.peso.replace(/\D/g, ""), 10) : undefined;
  const wingspanCm = data.envergadura
    ? parseInt(data.envergadura.replace(/\D/g, ""), 10)
    : undefined;

  const teamSlug = data.equipo
    ? teamSlugByName.get(slugify(data.equipo)) ?? slugify(data.equipo)
    : undefined;

  return {
    slug,
    firstName: data.nombre,
    lastName: lastName || "—",
    jerseyNumber: data.numero ? parseInt(data.numero, 10) : undefined,
    position: position as "PG" | "SG" | "SF" | "PF" | "C" | undefined,
    category: category as "U15" | "U17" | "U19" | "PREMIER" | undefined,
    heightCm: Number.isFinite(heightCm) ? heightCm : undefined,
    weightKg: Number.isFinite(weightKg) ? weightKg : undefined,
    wingspanCm: Number.isFinite(wingspanCm) ? wingspanCm : undefined,
    age: data.edad ? parseInt(data.edad, 10) : undefined,
    birthdate: parseBirthdate(data.nacimiento),
    biography: data.biografia,
    achievements,
    highlightUrl: data.video,
    photoUrl: data.foto,
    instagram: data.instagram,
    tiktok: data.tiktok,
    youtube: data.youtube,
    teamSlug,
  };
}

export type PlayerCsvValidation = {
  totalRows: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  errors: ImportRowError[];
  warnings: ImportRowError[];
  validNames: string[];
};

export function validatePlayersCsv(
  rows: Record<string, string>[],
  existingTeamNames: string[]
): PlayerCsvValidation {
  const teamSlugs = new Set(
    existingTeamNames.map((n) => slugify(n))
  );
  const errors: ImportRowError[] = [];
  const warnings: ImportRowError[] = [];
  const validNames: string[] = [];

  rows.forEach((raw, i) => {
    const rowIndex = i + 2;
    if (isEmptyCsvRow(raw)) return;

    const result = parsePlayerRow(raw, rowIndex);
    if (result.skip) return;
    if (result.error) {
      errors.push(result.error);
      return;
    }
    if (!result.data) return;

    const name = `${result.data.nombre} ${result.data.apellido ?? ""}`.trim();
    validNames.push(name);

    if (result.data.equipo) {
      const teamSlug = slugify(result.data.equipo);
      if (!teamSlugs.has(teamSlug)) {
        warnings.push({
          row: rowIndex,
          message: `Equipo "${result.data.equipo}" no existe — el jugador se importará sin equipo`,
        });
      }
    }
  });

  return {
    totalRows: rows.length,
    validCount: validNames.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    validNames,
  };
}

export function validateTeamsCsv(
  rows: Record<string, string>[]
): PlayerCsvValidation {
  const errors: ImportRowError[] = [];
  const validNames: string[] = [];

  rows.forEach((raw, i) => {
    const rowIndex = i + 2;
    if (isEmptyCsvRow(raw)) return;
    const row = normalizeCsvRow(raw);
    const name = (row.nombre || row.name || "").trim();
    const genero = normalizeGenderDivision(
      row.genero || row.gender || row.genderdivision || ""
    );
    const categoryDivision = (
      row.categoriadivision ||
      row.categorydivision ||
      row.categoria ||
      row.category ||
      ""
    ).trim();
    if (!name) {
      errors.push({ row: rowIndex, message: "Falta el nombre del equipo" });
      return;
    }
    if (!genero) {
      errors.push({
        row: rowIndex,
        message: "Falta género (Varonil, Femenil)",
      });
      return;
    }
    if (!categoryDivision) {
      errors.push({
        row: rowIndex,
        message: "Falta categoría (ej. 2007-2009, 2010-2011)",
      });
      return;
    }
    validNames.push(name);
  });

  return {
    totalRows: rows.length,
    validCount: validNames.length,
    errorCount: errors.length,
    warningCount: 0,
    errors,
    warnings: [],
    validNames,
  };
}

export const CSV_TEMPLATES = {
  players: `nombre,equipo,numero,posicion,altura,peso,categoria,biografia,nacimiento,edad,envergadura,logro1,logro2,logro3,logro4,logro5,video,foto,instagram,tiktok,youtube
Mateo Hernández,Lobos Norte,7,Base,185,78,2007-2009,Captán y líder ofensivo,2008-03-15,17,192,MVP Regional 2025,Selección estatal,Top 10 scoring,Campeón estatal 2024,All-Tournament 2025,https://youtube.com/watch?v=example,https://example.com/foto.jpg,@mateo.h,@mateoh,`,
  teams: `nombre,genero,categoriadivision,logo,entrenadores,descripcion
Lobos Norte,Varonil,2007-2009,https://placehold.co/120x120,Coach García,Programa elite del norte
Bachilleres,Femenil,2007-2009,https://placehold.co/120x120,Coach Ruiz,Programa elite`,
  schedule: `fecha,hora,local,visitante,sede,categoria,ronda
2026-06-15,10:00,Lobos Norte,Águilas CDMX,Cancha Principal,U17,Grupos - J1`,
};
