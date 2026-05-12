// components/analises/AnaliseCard.tsx
import Link from "next/link";
import type { AnaliseCardData, AnaliseStatus, AnaliseSport } from "@/lib/mocks/analises.mock";

// ─── Mapas visuais ────────────────────────────────────────────────────────────

const SPORT_ICON: Record<AnaliseSport, string> = {
  futebol:             "⚽",
  basquete:            "🏀",
  "futebol-americano": "🏈",
  tenis:               "🎾",
  mma:                 "🥊",
  esports:             "🎮",
};

const SPORT_PILL: Record<AnaliseSport, { bg: string; text: string }> = {
  futebol:             { bg: "rgba(29,185,84,.10)",   text: "#1DB954" },
  basquete:            { bg: "rgba(255,100,0,.10)",   text: "#FF6400" },
  "futebol-americano": { bg: "rgba(160,102,224,.10)", text: "#A066E0" },
  tenis:               { bg: "rgba(240,180,41,.10)",  text: "#F0B429" },
  mma:                 { bg: "rgba(229,56,79,.10)",   text: "#E5384F" },
  esports:             { bg: "rgba(26,140,255,.10)",  text: "#1A8CFF" },
};

const STATUS_CFG: Record<
  AnaliseStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  pendente: {
    label:  "Pendente",
    bg:     "rgba(240,180,41,.10)",
    border: "rgba(240,180,41,.22)",
    text:   "#F0B429",
  },
  green: {
    label:  "Green ✓",
    bg:     "rgba(29,185,84,.10)",
    border: "rgba(29,185,84,.22)",
    text:   "#1DB954",
  },
  red: {
    label:  "Red ✗",
    bg:     "rgba(229,56,79,.10)",
    border: "rgba(229,56,79,.22)",
    text:   "#E5384F",
  },
  push: {
    label:  "Push =",
    bg:     "rgba(125,143,163,.12)",
    border: "rgba(125,143,163,.22)",
    text:   "#7D8FA3",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDataCurta(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day:   "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnaliseCardProps {
  analise: AnaliseCardData;
  index?:  number;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AnaliseCard({ analise, index = 0 }: AnaliseCardProps) {
  const sport     = SPORT_PILL[analise.esporte];
  const tipStatus = analise.tip ? STATUS_CFG[analise.tip.status] : null;

  return (
    <Link
      href={`/analises/${analise.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background:       "#0E1318",
        border:           "1px solid #1E2D3D",
        animationDelay:   `${index * 70}ms`,
        textDecoration:   "none",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background   = "#141A22";
        el.style.borderColor  = "#253545";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background   = "#0E1318";
        el.style.borderColor  = "#1E2D3D";
      }}
    >
      {/* ── Topo: esporte + campeonato + status ─────────────────────── */}
      <div
        className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5"
        style={{ borderBottom: "1px solid #1E2D3D" }}
      >
        {/* Pill esporte + campeonato */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.4px] flex-shrink-0"
            style={{ background: sport.bg, color: sport.text }}
          >
            <span aria-hidden="true" className="text-[11px] leading-none">
              {SPORT_ICON[analise.esporte]}
            </span>
            {analise.esporte === "futebol-americano" ? "NFL" : analise.esporte}
          </span>
          <span
            className="text-[11px] font-medium truncate"
            style={{ color: "#4A5A6B" }}
          >
            {analise.campeonato}
          </span>
        </div>

        {/* Badge de status da tip (se houver) */}
        {tipStatus && (
          <span
            className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-[0.3px] flex-shrink-0"
            style={{
              background: tipStatus.bg,
              border:     `1px solid ${tipStatus.border}`,
              color:      tipStatus.text,
            }}
          >
            {tipStatus.label}
          </span>
        )}

        {/* Badge premium (sem tip) */}
        {!tipStatus && analise.isPremium && (
          <span
            className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-[0.3px] flex-shrink-0"
            style={{
              background: "rgba(240,180,41,.10)",
              border:     "1px solid rgba(240,180,41,.22)",
              color:      "#F0B429",
            }}
          >
            ⭐ Premium
          </span>
        )}
      </div>

      {/* ── Corpo: jogo + título + resumo ───────────────────────────── */}
      <div className="flex flex-col gap-2.5 px-4 py-3.5 flex-1">
        {/* Jogo */}
        <span
          className="text-[11px] font-semibold"
          style={{ color: "#7D8FA3" }}
        >
          {analise.jogo}
        </span>

        {/* Título */}
        <h3
          className="leading-snug transition-colors duration-150"
          style={{
            fontFamily:    "'Oswald', Georgia, serif",
            fontSize:      15,
            fontWeight:    700,
            color:         "#FFFFFF",
            letterSpacing: "-0.02em",
            display:       "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow:       "hidden",
          }}
        >
          {analise.titulo}
        </h3>

        {/* Resumo */}
        <p
          className="text-[13px] leading-relaxed"
          style={{
            color:            "#7D8FA3",
            display:          "-webkit-box",
            WebkitLineClamp:  3,
            WebkitBoxOrient:  "vertical",
            overflow:         "hidden",
          }}
        >
          {analise.resumo}
        </p>
      </div>

      {/* ── Tip associada (odd em destaque) ─────────────────────────── */}
      {analise.tip && (
        <div
          className="flex items-center justify-between gap-2 mx-4 mb-3 px-3 py-2.5 rounded-lg"
          style={{
            background: "#141A22",
            border:     "1px solid #1E2D3D",
          }}
        >
          <div className="flex flex-col min-w-0">
            <span
              className="text-[9px] uppercase tracking-[0.6px] mb-0.5"
              style={{ color: "#4A5A6B" }}
            >
              Seleção
            </span>
            <span
              className="text-[12px] font-semibold truncate"
              style={{ color: "#C8D3E0" }}
            >
              {analise.tip.selecao}
            </span>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className="leading-none tabular-nums"
              style={{
                fontFamily:    "'JetBrains Mono', 'Courier New', monospace",
                fontSize:      18,
                fontWeight:    700,
                color:         "#F0B429",
                letterSpacing: "-0.04em",
              }}
            >
              {analise.tip.odd.toFixed(2)}
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.5px] mt-0.5"
              style={{ color: "#4A5A6B" }}
            >
              odd
            </span>
          </div>
        </div>
      )}

      {/* ── Rodapé: autor + data + views + leitura ──────────────────── */}
      <div
        className="flex items-center justify-between gap-2 px-4 pb-3.5 pt-2.5"
        style={{ borderTop: "1px solid #1E2D3D" }}
      >
        {/* Autor */}
        <div className="flex items-center gap-1.5">
          {/* Avatar gerado por inicial */}
          <span
            className="inline-flex items-center justify-center rounded-full text-[9px] font-bold flex-shrink-0"
            style={{
              width:      18,
              height:     18,
              background: "rgba(240,180,41,.15)",
              border:     "1px solid rgba(240,180,41,.25)",
              color:      "#F0B429",
              fontFamily: "'JetBrains Mono', monospace",
            }}
            aria-hidden="true"
          >
            {analise.autor[0].toUpperCase()}
          </span>
          <span className="text-[11px] font-medium" style={{ color: "#7D8FA3" }}>
            {analise.autor}
          </span>
        </div>

        {/* Meta: data · views · tempo */}
        <div
          className="flex items-center gap-2 text-[10px]"
          style={{ color: "#4A5A6B" }}
        >
          <span>{formatDataCurta(analise.dataPublicacao)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatViews(analise.views)} views</span>
          <span aria-hidden="true">·</span>
          <span>{analise.tempoLeitura} min</span>
        </div>
      </div>
    </Link>
  );
}