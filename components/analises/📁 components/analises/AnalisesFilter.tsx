// components/analises/AnalisesFilter.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { siteConfig } from "@/config/site";
import type { FiltroEsporte, FiltroStatus } from "@/lib/mocks/analises.mock";

// ─── Opções dos filtros ───────────────────────────────────────────────────────

const ESPORTES: { value: FiltroEsporte; label: string; icon: string }[] = [
  { value: "todos",             label: "Todos",    icon: "🏆" },
  { value: "futebol",           label: "Futebol",  icon: "⚽" },
  { value: "basquete",          label: "Basquete", icon: "🏀" },
  { value: "futebol-americano", label: "NFL",      icon: "🏈" },
  { value: "tenis",             label: "Tênis",    icon: "🎾" },
  { value: "mma",               label: "MMA",      icon: "🥊" },
  { value: "esports",           label: "eSports",  icon: "🎮" },
];

const RESULTADOS: { value: FiltroStatus; label: string }[] = [
  { value: "todos",    label: "Todos"    },
  { value: "pendente", label: "Pendente" },
  { value: "green",    label: "Green ✓"  },
  { value: "red",      label: "Red ✗"    },
  { value: "push",     label: "Push ="   },
];

// ─── Estilos de chip ──────────────────────────────────────────────────────────

const chipBase: React.CSSProperties = {
  display:       "inline-flex",
  alignItems:    "center",
  gap:           3,
  height:        30,
  padding:       "0 12px",
  borderRadius:  15,
  fontSize:      12,
  fontWeight:    600,
  whiteSpace:    "nowrap",
  border:        "1px solid #1E2D3D",
  background:    "#141A22",
  color:         "#7D8FA3",
  cursor:        "pointer",
  transition:    "all .15s",
  letterSpacing: "0.1px",
};

const chipActive: React.CSSProperties = {
  ...chipBase,
  background: "rgba(240,180,41,.10)",
  border:     "1px solid rgba(240,180,41,.22)",
  color:      "#F0B429",
};

// ─── Componente ───────────────────────────────────────────────────────────────

interface AnalisesFilterProps {
  esporteAtivo: FiltroEsporte;
  statusAtivo:  FiltroStatus;
}

export function AnalisesFilter({ esporteAtivo, statusAtivo }: AnalisesFilterProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "todos") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page"); // reset paginação ao filtrar
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Filtro por esporte */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {ESPORTES.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setParam("esporte", value)}
            style={esporteAtivo === value ? chipActive : chipBase}
            aria-pressed={esporteAtivo === value}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Filtro por resultado */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {RESULTADOS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setParam("status", value)}
            style={statusAtivo === value ? chipActive : chipBase}
            aria-pressed={statusAtivo === value}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}