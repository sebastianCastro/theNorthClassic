import * as XLSX from "xlsx";
import {
  parsePlayerRow,
  playerCsvToDbFields,
  parseBirthdate,
  isEmptyCsvRow,
  normalizeCsvRow,
  normalizeGenderDivision,
} from "./csv-import";
import { slugify } from "./utils";
import type { SiteConfig } from "./site-config";
import { DEFAULT_SITE_CONFIG, STAT_LEADER_KEYS } from "./site-config";

// re-export for settings sheet parser
export { STAT_LEADER_KEYS };

export type ImportSheetResult = {
  sheet: string;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
  warnings: { row: number; message: string }[];
};

function sheetToRows(wb: XLSX.WorkBook, names: string[]): Record<string, string>[] {
  for (const name of names) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: "",
      raw: false,
    });
  }
  return [];
}

function parseSettingsRows(rows: Record<string, string>[]): Partial<SiteConfig> & {
  org?: Record<string, string>;
  sponsors?: { name: string; website?: string; logoUrl?: string }[];
} {
  const config: SiteConfig = { ...DEFAULT_SITE_CONFIG, tournament: {} };
  const org: Record<string, string> = {};
  const sponsors: { name: string; website?: string; logoUrl?: string }[] = [];
  let section = "";

  for (const raw of rows) {
    const row = normalizeCsvRow(raw);
    const key = (
      row.campo ||
      row.field ||
      row.seccion ||
      row.section ||
      row.clave ||
      row.key ||
      row.nombre ||
      ""
    ).trim();
    const value = (
      row.valor ||
      row.value ||
      row.contenido ||
      row.content ||
      ""
    ).trim();
    if (!key && !value) continue;

    const keyLower = key.toLowerCase();

    if (keyLower.startsWith("###") || keyLower === "seccion") {
      section = value || key.replace(/#/g, "").trim();
      continue;
    }

    if (section.toLowerCase().includes("organiz") || keyLower.includes("organiz")) {
      org[key] = value;
    }

    if (keyLower.includes("genero") && value) {
      config.genderDivisions = value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
    }
    if (
      (keyLower.includes("categoria") && keyLower.includes("division")) ||
      keyLower === "categorydivisions" ||
      keyLower === "categorias"
    ) {
      config.categoryDivisions = value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
    }
    if (keyLower.startsWith("regla") && value) {
      config.rules.push(value);
    }
    if (keyLower.startsWith("pregunta") || keyLower === "faq_pregunta") {
      const q = value;
      const next = rows.find(() => false);
      void next;
      config.faqs.push({ q, a: "" });
    }
    if (keyLower.startsWith("respuesta") || keyLower === "faq_respuesta") {
      const last = config.faqs[config.faqs.length - 1];
      if (last) last.a = value;
    }
    if (keyLower.includes("destacado") || keyLower.includes("featured")) {
      config.featuredPlayerSlugs.push(
        ...value.split(/[,;]/).map((s) => slugify(s.trim())).filter(Boolean)
      );
    }
    if (keyLower.includes("lider") || keyLower.includes("leader")) {
      const parts = value.split("|");
      if (parts.length >= 4) {
        config.statLeaders.push({
          categoryDivision: parts[0].trim(),
          genderDivision: parts[1].trim(),
          statKey: parts[2].trim(),
          statLabel:
            STAT_LEADER_KEYS.find((s) => s.key === parts[2].trim())?.label ??
            parts[2].trim(),
          playerSlug: slugify(parts[3].trim()),
        });
      }
    }
    if (keyLower.includes("patrocinador") && value && !keyLower.includes("logo")) {
      sponsors.push({ name: value });
    }

    const orgMap: Record<string, keyof typeof org> = {
      "nombre organizacion": "organizationName",
      "organization name": "organizationName",
      email: "contactEmail",
      correo: "contactEmail",
      telefono: "contactPhone",
      whatsapp: "contactWhatsapp",
      direccion: "address",
      instagram: "socialInstagram",
      facebook: "socialFacebook",
      tiktok: "socialTiktok",
      youtube: "socialYoutube",
    };
    for (const [pattern, field] of Object.entries(orgMap)) {
      if (keyLower.includes(pattern) || keyLower === pattern) {
        org[field] = value;
      }
    }

    const t = config.tournament;
    if (keyLower.includes("titulo torneo") || keyLower === "tournamenttitle")
      t.name = value;
    if (keyLower.includes("edicion")) t.edition = value;
    if (keyLower.includes("descripcion torneo")) t.description = value;
    if (keyLower.includes("ubicacion") || keyLower === "location") t.location = value;
    if (keyLower.includes("sede") || keyLower === "venue") t.venue = value;
    if (keyLower.includes("inicio") || keyLower === "startdate") t.startDate = value;
    if (keyLower.includes("fin") || keyLower === "enddate") t.endDate = value;
  }

  return { ...config, org, sponsors };
}

/** Formato tabular alternativo: columnas tipo key-value en filas */
export function parseBasicSettingsSheet(
  rows: Record<string, string>[]
): {
  config: SiteConfig;
  orgFields: Record<string, string>;
  sponsorRows: { name: string; website?: string; logoUrl?: string }[];
} {
  const sponsors: { name: string; website?: string; logoUrl?: string }[] = [];
  const config: SiteConfig = {
    ...DEFAULT_SITE_CONFIG,
    rules: [],
    faqs: [],
    featuredPlayerSlugs: [],
    statLeaders: [],
    tournament: {},
  };
  const orgFields: Record<string, string> = {};

  for (const raw of rows) {
    if (isEmptyCsvRow(raw)) continue;
    const row = normalizeCsvRow(raw);

    if (row.patrocinador || row.sponsor || row.nombrepatrocinador) {
      sponsors.push({
        name: row.patrocinador || row.sponsor || row.nombrepatrocinador,
        website: row.sitio || row.website || row.url,
        logoUrl: row.logo || row.logourl,
      });
      continue;
    }

    if (row.regla || row.rule) {
      config.rules.push(row.regla || row.rule);
      continue;
    }
    if (row.pregunta || row.faq) {
      config.faqs.push({
        q: row.pregunta || row.faq,
        a: row.respuesta || row.answer || "",
      });
      continue;
    }
    if (row.genero || row.genderdivision) {
      const val = row.genero || row.genderdivision;
      if (!config.genderDivisions.includes(val)) {
        config.genderDivisions = [...config.genderDivisions, val];
      }
      continue;
    }
    if (row.categoriadivision || row.categorydivision) {
      const val = row.categoriadivision || row.categorydivision;
      if (!config.categoryDivisions.includes(val)) {
        config.categoryDivisions = [...config.categoryDivisions, val];
      }
      continue;
    }
    if (row.jugadordestacado || row.featuredplayer) {
      config.featuredPlayerSlugs.push(
        slugify(row.jugadordestacado || row.featuredplayer)
      );
      continue;
    }
    if (row.liderstat || row.statleader) {
      const parts = (row.liderstat || row.statleader).split("|");
      if (parts.length >= 4) {
        const statKey = parts[2].trim();
        config.statLeaders.push({
          categoryDivision: parts[0].trim(),
          genderDivision: parts[1].trim(),
          statKey,
          statLabel:
            STAT_LEADER_KEYS.find((s) => s.key === statKey)?.label ?? statKey,
          playerSlug: slugify(parts[3].trim()),
        });
      }
      continue;
    }

    const campo = (row.campo || row.field || row.clave || "").toLowerCase();
    const valor = row.valor || row.value || "";
    if (!campo) continue;

    if (campo.includes("email")) orgFields.contactEmail = valor;
    if (campo.includes("telefono") && !campo.includes("whats"))
      orgFields.contactPhone = valor;
    if (campo.includes("whatsapp")) orgFields.contactWhatsapp = valor;
    if (campo.includes("direccion") || campo.includes("address"))
      orgFields.address = valor;
    if (campo.includes("instagram")) orgFields.socialInstagram = valor;
    if (campo.includes("facebook")) orgFields.socialFacebook = valor;
    if (campo.includes("tiktok")) orgFields.socialTiktok = valor;
    if (campo.includes("youtube")) orgFields.socialYoutube = valor;
    if (campo.includes("organizacion") || campo === "nombre")
      orgFields.organizationName = valor;
    if (campo.includes("titulo") && campo.includes("torneo"))
      config.tournament.name = valor;
    if (campo.includes("edicion")) config.tournament.edition = valor;
    if (campo.includes("descripcion")) config.tournament.description = valor;
    if (campo.includes("ubicacion")) config.tournament.location = valor;
    if (campo.includes("sede")) config.tournament.venue = valor;
    if (campo.includes("fecha") && campo.includes("inicio"))
      config.tournament.startDate = valor;
    if (campo.includes("fecha") && campo.includes("fin"))
      config.tournament.endDate = valor;
  }

  return { config, orgFields, sponsorRows: sponsors };
}

export function readWorkbook(buffer: ArrayBuffer): XLSX.WorkBook {
  return XLSX.read(buffer, { type: "array", cellDates: true });
}

export function getSheetRows(
  wb: XLSX.WorkBook,
  candidates: string[]
): Record<string, string>[] {
  const names = wb.SheetNames;
  for (const c of candidates) {
    const exact = names.find((n) => n.toLowerCase() === c.toLowerCase());
    if (exact) return sheetToRows(wb, [exact]);
    const partial = names.find((n) => n.toLowerCase().includes(c.toLowerCase()));
    if (partial) return sheetToRows(wb, [partial]);
  }
  return [];
}

export { parsePlayerRow, playerCsvToDbFields, parseBirthdate, isEmptyCsvRow, normalizeCsvRow };

export function parseTeamRow(raw: Record<string, string>, rowIndex: number) {
  if (isEmptyCsvRow(raw)) return { skip: true as const };
  const row = normalizeCsvRow(raw);
  const name = (row.nombre || row.name || row.equipo || "").trim();
  const genderDivision = normalizeGenderDivision(
    row.genero || row.gender || row.genderdivision || row.divisiongenero || ""
  );
  const categoryDivision = (
    row.categoriadivision ||
    row.categorydivision ||
    row.categoria ||
    row.divisioncategoria ||
    ""
  ).trim();

  if (!name) {
    return {
      error: { row: rowIndex, message: "Falta nombre del equipo" },
    };
  }
  if (!genderDivision) {
    return {
      error: {
        row: rowIndex,
        message: "Falta género (Varonil, Femenil)",
      },
    };
  }
  if (!categoryDivision) {
    return {
      error: {
        row: rowIndex,
        message: "Falta categoría (ej. 2007-2009)",
      },
    };
  }
  return {
    data: {
      name,
      genderDivision,
      categoryDivision,
      city: row.ciudad || row.city,
      logoUrl: row.logo || row.logourl,
      coaches: row.entrenadores || row.coaches,
      description: row.descripcion || row.description,
    },
  };
}
