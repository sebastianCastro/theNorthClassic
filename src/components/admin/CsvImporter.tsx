"use client";

import { useCallback, useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CSV_TEMPLATES,
  validatePlayersCsv,
  validateTeamsCsv,
  type PlayerCsvValidation,
} from "@/lib/csv-import";
import { importPlayersCsv, importTeamsCsv } from "@/app/admin/actions";
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type ImportType = "players" | "teams";

type ImportResult = {
  success?: boolean;
  created?: number;
  updated?: number;
  errors?: { row: number; message: string }[];
  warnings?: { row: number; message: string }[];
  duplicates?: number[];
  total?: number;
};

type CsvImporterProps = {
  type: ImportType;
  teamNames?: string[];
};

export function CsvImporter({ type, teamNames = [] }: CsvImporterProps) {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [validation, setValidation] = useState<PlayerCsvValidation | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const parseFile = useCallback(
    async (file: File) => {
      setResult(null);
      setFileName(file.name);
      const text = await file.text();
      setCsvText(text);

      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });

      const rows = parsed.data ?? [];
      setPreview(rows.slice(0, 5));

      setValidation(
        type === "players"
          ? validatePlayersCsv(rows, teamNames)
          : validateTeamsCsv(rows)
      );
    },
    [type, teamNames]
  );

  const handleImport = async () => {
    if (!csvText) return;
    setLoading(true);
    setResult(null);
    try {
      const res =
        type === "players"
          ? await importPlayersCsv(csvText)
          : await importTeamsCsv(csvText);
      setResult(res);
      if ((res.created ?? 0) + (res.updated ?? 0) > 0) {
        router.refresh();
      }
    } catch (e) {
      setResult({
        errors: [{ row: 0, message: (e as Error).message }],
        success: false,
      });
    }
    setLoading(false);
  };

  const template = CSV_TEMPLATES[type];
  const canImport =
    csvText &&
    !loading &&
    (validation && validation.validCount > 0);

  const importedCount = (result?.created ?? 0) + (result?.updated ?? 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="font-semibold text-white capitalize">
        Importar {type === "players" ? "jugadores" : "equipos"}
      </h3>
      <p className="mt-2 text-sm text-muted">
        1. Selecciona tu CSV · 2. Revisa la vista previa · 3. Confirma la
        importación
      </p>

      <button
        type="button"
        onClick={() => {
          const blob = new Blob([template], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `plantilla-${type}.csv`;
          a.click();
        }}
        className="btn-secondary mt-4 inline-flex text-xs"
      >
        <Download size={16} aria-hidden />
        Descargar plantilla CSV
      </button>

      <div className="mt-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-accent">
          <Upload className="text-muted" aria-hidden />
          <span className="mt-2 text-sm text-white">
            {fileName ?? "Seleccionar archivo CSV"}
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void parseFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {validation && (
        <div className="mt-4 rounded border border-border bg-black/40 p-4 text-sm">
          <p className="text-white">
            <span className="font-semibold text-accent">
              {validation.validCount}
            </span>{" "}
            {type === "players" ? "jugador" : "equipo"}
            {validation.validCount !== 1 ? "s" : ""} listo
            {validation.validCount !== 1 ? "s" : ""} para importar
          </p>
          {type === "teams" && (
            <p className="mt-2 text-xs text-muted">
              Después importa jugadores (o re-importa) para asignar rosters por
              columna &quot;equipo&quot;.
            </p>
          )}
          {validation.errorCount > 0 && (
            <p className="mt-1 text-red-400">
              {validation.errorCount} fila
              {validation.errorCount !== 1 ? "s" : ""} con error (no se
              importarán)
            </p>
          )}
          {validation.warningCount > 0 && (
            <p className="mt-1 text-yellow-500">
              {validation.warningCount} advertencia
              {validation.warningCount !== 1 ? "s" : ""} (sí se importarán)
            </p>
          )}
        </div>
      )}

      {preview.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">
            Vista previa (primeras 5 filas)
          </p>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted">
                {Object.keys(preview[0]).map((k) => (
                  <th key={k} className="p-2 whitespace-nowrap">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-border">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="p-2 text-gray-100 max-w-[200px] truncate">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(validation?.errors.length ?? 0) > 0 && !result && (
        <div className="mt-4 rounded border border-red-900/50 bg-red-950/30 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-red-400">
            <AlertCircle size={18} aria-hidden />
            Errores en el archivo (corrige antes de importar)
          </p>
          <ul className="mt-2 max-h-40 overflow-y-auto list-inside list-disc text-sm text-red-300">
            {validation!.errors.map((e) => (
              <li key={`${e.row}-${e.message}`}>
                Fila {e.row}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation?.warnings && validation.warnings.length > 0 && !result && (
        <div className="mt-4 rounded border border-yellow-900/50 bg-yellow-950/20 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-yellow-500">
            <AlertTriangle size={18} aria-hidden />
            Advertencias
          </p>
          <ul className="mt-2 max-h-32 overflow-y-auto list-inside list-disc text-sm text-yellow-200/80">
            {validation.warnings.map((w) => (
              <li key={`${w.row}-${w.message}`}>
                Fila {w.row}: {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={!canImport}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading
          ? "Importando…"
          : `Confirmar importación (${validation?.validCount ?? 0} ${type === "players" ? "jugadores" : "equipos"})`}
      </button>

      {!csvText && (
        <p className="mt-2 text-center text-xs text-muted">
          Primero selecciona un archivo CSV
        </p>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {importedCount > 0 && (
            <div className="flex gap-2 rounded border border-green-900/50 bg-green-950/30 p-4 text-green-400">
              <CheckCircle2 size={22} className="shrink-0" aria-hidden />
              <div>
                <p className="font-medium">Importación completada</p>
                <p className="mt-1 text-sm">
                  {result.created ?? 0} creado
                  {(result.created ?? 0) !== 1 ? "s" : ""},{" "}
                  {result.updated ?? 0} actualizado
                  {(result.updated ?? 0) !== 1 ? "s" : ""}
                  {(result.duplicates?.length ?? 0) > 0 && (
                    <span className="block text-muted mt-1">
                      Filas existentes actualizadas:{" "}
                      {result.duplicates?.join(", ")}
                    </span>
                  )}
                </p>
                <Link
                  href={type === "players" ? "/jugadores" : "/equipos"}
                  className="mt-3 inline-block text-sm font-semibold text-white underline hover:text-accent"
                >
                  Ver {type === "players" ? "jugadores" : "equipos"} →
                </Link>
              </div>
            </div>
          )}

          {(result.warnings?.length ?? 0) > 0 && (
            <div className="rounded border border-yellow-900/50 p-4">
              <p className="text-sm font-medium text-yellow-500">
                Advertencias
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted">
                {result.warnings!.map((w) => (
                  <li key={`${w.row}-${w.message}`}>
                    Fila {w.row}: {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.errors?.length ?? 0) > 0 && (
            <div className="rounded border border-red-900/50 p-4">
              <p className="text-sm font-medium text-red-400">
                {importedCount > 0
                  ? "Algunas filas no se importaron"
                  : `No se importó ningún ${type === "players" ? "jugador" : "equipo"}`}
              </p>
              <ul className="mt-2 max-h-48 overflow-y-auto list-inside list-disc text-sm text-red-300">
                {result.errors!.map((e) => (
                  <li key={`${e.row}-${e.message}`}>
                    Fila {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {importedCount === 0 && !(result.errors?.length) && (
            <p className="text-sm text-muted">
              No había filas válidas para importar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
