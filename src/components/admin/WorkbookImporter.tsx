"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importTournamentWorkbook } from "@/app/admin/import-workbook";
import { Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export function WorkbookImporter() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof importTournamentWorkbook>
  > | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const buffer = await file.arrayBuffer();
      const res = await importTournamentWorkbook(buffer);
      setResult(res);
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="font-semibold text-white">Importación única del torneo</h3>
      <p className="mt-2 text-sm text-muted">
        Sube un archivo Excel (.xlsx) con 3 hojas:{" "}
        <strong className="text-white">Players</strong>,{" "}
        <strong className="text-white">Teams</strong>,{" "}
        <strong className="text-white">Basic Settings</strong>.
      </p>
      <p className="mt-2 text-xs text-muted">
        Orden recomendado en el archivo: Teams → Basic Settings → Players. El
        sistema vincula jugadores al equipo por la columna &quot;equipo&quot;.
      </p>

      <a
        href="/plantilla-north-classic.xlsx"
        download
        className="btn-secondary mt-4 inline-flex text-xs"
      >
        <Download size={16} aria-hidden />
        Descargar plantilla Excel
      </a>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-accent/40 p-10 hover:border-accent">
        <Upload className="text-accent" aria-hidden />
        <span className="mt-2 text-sm text-white">
          {loading ? "Importando…" : "Seleccionar archivo .xlsx"}
        </span>
        <input
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          disabled={loading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </label>

      {result && (
        <div className="mt-8 space-y-4 text-sm">
          <div className="flex gap-2 text-green-400">
            <CheckCircle2 size={20} />
            <div>
              <p className="font-medium">Equipos: {result.teams.created} nuevos, {result.teams.updated} actualizados</p>
              <p className="font-medium">Jugadores: {result.players.created} nuevos, {result.players.updated} actualizados</p>
              <p className="text-muted">{result.settings.message}</p>
            </div>
          </div>
          {(result.teams.errors.length > 0 || result.players.errors.length > 0) && (
            <div className="text-red-400">
              <p className="flex items-center gap-2 font-medium">
                <AlertCircle size={18} /> Errores
              </p>
              <ul className="mt-2 list-disc pl-5">
                {[...result.teams.errors, ...result.players.errors].map((e) => (
                  <li key={`${e.row}-${e.message}`}>
                    Fila {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
