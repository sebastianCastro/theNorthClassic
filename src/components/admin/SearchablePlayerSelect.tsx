"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlayerSelectOption = {
  slug: string;
  label: string;
};

type Props = {
  options: PlayerSelectOption[];
  value: string;
  onChange: (slug: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
};

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function SearchablePlayerSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar jugador…",
  emptyLabel = "— Sin asignar —",
  disabled = false,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((o) => o.slug === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    if (!q) return options;
    return options.filter((o) => normalizeSearch(o.label).includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery(selected?.label ?? "");
    }
  }, [open, selected]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selected?.label ?? "");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [selected]);

  const pick = (slug: string) => {
    onChange(slug);
    setOpen(false);
    const next = options.find((o) => o.slug === slug);
    setQuery(next?.label ?? "");
  };

  const clear = () => {
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          disabled={disabled}
          placeholder={placeholder}
          value={open ? query : (selected?.label ?? query)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery(selected?.label ?? "");
          }}
          className="w-full rounded border border-border bg-black py-2 pl-3 pr-16 text-sm text-white"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 pr-2 text-muted">
          {value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Quitar jugador"
              className="pointer-events-auto rounded p-1 hover:bg-white/10 hover:text-white"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clear}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </div>
      </div>

      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded border border-border bg-[#111] py-1 shadow-lg"
        >
          <li role="option">
            <button
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-white/10",
                !value ? "text-accent" : "text-muted"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick("")}
            >
              {emptyLabel}
            </button>
          </li>
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">Sin resultados</li>
          ) : (
            filtered.map((o) => (
              <li key={o.slug} role="option" aria-selected={o.slug === value}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-white/10",
                    o.slug === value ? "bg-white/5 text-accent" : "text-white"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o.slug)}
                >
                  {o.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
