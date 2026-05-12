"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { TipFilters } from "@/types/database.types";

interface TipsFilterProps {
  currentFilters: TipFilters;
}

const RESULTADOS = [
  { value: "",        label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "win",     label: "Green ✓" },
  { value: "loss",    label: "Red ✗" },
  { value: "push",    label: "Push =" },
];

export function TipsFilter({ currentFilters }: TipsFilterProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset paginação ao filtrar
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Filtro por esporte */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => updateFilter("esporte", "")}
          className={cn(
            "badge cursor-pointer transition-all",
            !currentFilters.esporte
              ? "badge-gold ring-1 ring-gold/30"
              : "bg-pitch-700 text-neutral-400 border border-pitch-600 hover:text-white",
          )}
        >
          Todos
        </button>
        {siteConfig.sports.map((sport) => (
          <button
            key={sport.slug}
            onClick={() => updateFilter("esporte", sport.slug)}
            className={cn(
              "badge cursor-pointer transition-all",
              currentFilters.esporte === sport.slug
                ? "badge-gold ring-1 ring-gold/30"
                : "bg-pitch-700 text-neutral-400 border border-pitch-600 hover:text-white",
            )}
          >
            {sport.icon} {sport.label}
          </button>
        ))}
      </div>

      {/* Divisor */}
      <div className="h-5 w-px bg-pitch-700 hidden sm:block" />

      {/* Filtro por resultado */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {RESULTADOS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter("resultado", value)}
            className={cn(
              "text-2xs px-2 py-0.5 rounded-md cursor-pointer transition-all font-medium uppercase tracking-wider border",
              currentFilters.resultado === value || (!currentFilters.resultado && value === "")
                ? "bg-gold/10 text-gold border-gold/30"
                : "bg-pitch-800 text-neutral-500 border-pitch-700 hover:text-neutral-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
