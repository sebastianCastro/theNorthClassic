"use client";

import { useState, useTransition } from "react";
import { saveFaqs } from "@/app/admin/actions";
import { Plus, Trash2 } from "lucide-react";

type FaqItem = { q: string; a: string };

export function FaqAdminForm({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(
    initialFaqs.length > 0 ? initialFaqs : []
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const updateItem = (index: number, field: "q" | "a", value: string) => {
    setFaqs((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setFaqs((list) => [...list, { q: "", a: "" }]);
  };

  const removeItem = (index: number) => {
    setFaqs((list) => list.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    startTransition(async () => {
      await saveFaqs(faqs);
      setMessage("Preguntas frecuentes guardadas.");
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Se muestran en la página del torneo. Deja la respuesta vacía si aún no
        la tienes.
      </p>

      <div className="space-y-4">
        {faqs.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                Pregunta {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                aria-label={`Eliminar pregunta ${index + 1}`}
              >
                <Trash2 size={14} aria-hidden />
                Eliminar
              </button>
            </div>
            <label className="block text-xs text-muted">
              Pregunta
              <input
                value={item.q}
                onChange={(e) => updateItem(index, "q", e.target.value)}
                required
                className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="mt-3 block text-xs text-muted">
              Respuesta
              <textarea
                value={item.a}
                onChange={(e) => updateItem(index, "a", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
              />
            </label>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <p className="text-sm text-muted">
          No hay preguntas todavía. Agrega la primera abajo.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addItem}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} aria-hidden />
          Agregar pregunta
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="btn-primary text-sm"
        >
          {pending ? "Guardando…" : "Guardar preguntas"}
        </button>
      </div>

      {message && <p className="text-sm text-green-400">{message}</p>}
    </div>
  );
}
