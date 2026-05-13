"use client";
import Link from "next/link";

// ── Dados das estatísticas ────────────────────────────────────────────────────
const STATS = [
  {
    value:   "1.200+",
    label:   "Tips publicadas",
    detail:  "desde 2022",
  },
  {
    value:   "68%",
    label:   "Taxa de acerto",
    detail:  "últimos 90 dias",
  },
  {
    value:   "340+",
    label:   "Análises gratuitas",
    detail:  "sem paywall",
  },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  /** Número de tips publicadas hoje — vem do servidor via page.tsx */
  tipsHoje?: number;
}

// ── Componente ────────────────────────────────────────────────────────────────
export function HeroSection({ tipsHoje = 0 }: HeroSectionProps) {
  const temTips = tipsHoje > 0;

  return (
    <section
      className="relative overflow-hidden bg-[#0E1318] border-b border-[#1E2D3D]"
      aria-labelledby="hero-titulo"
    >

      {/* ── Fundo: grade sutil ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Brilho dourado radial no topo ───────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] h-[260px]"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(240,180,41,0.07) 0%, transparent 72%)",
        }}
      />

      {/* ── Linha dourada no topo ───────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #C8920A 50%, transparent 100%)",
          opacity: 0.55,
        }}
      />

      {/* ── Conteúdo ────────────────────────────────────────────────────── */}
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

        {/* Eyebrow badge */}
        <div className="mb-5">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.6px] uppercase"
            style={{
              background: "rgba(29,185,84,0.08)",
              border:     "1px solid rgba(29,185,84,0.20)",
              color:      "#1DB954",
            }}
          >
            {/* Dot pulsante */}
            <span
              aria-hidden="true"
              className="w-[6px] h-[6px] rounded-full bg-[#1DB954] animate-pulse flex-shrink-0"
            />
            {temTips
              ? `${tipsHoje} tip${tipsHoje > 1 ? "s" : ""} publicada${tipsHoje > 1 ? "s" : ""} hoje`
              : "Portal de apostas esportivas"}
          </span>
        </div>

        {/* Título principal */}
        <h1
          id="hero-titulo"
          className="mb-4 leading-[1.06] tracking-[-0.03em] text-white"
          style={{
            fontFamily: "'Oswald', Georgia, serif",
            fontSize:   "clamp(28px, 6vw, 52px)",
            fontWeight: 700,
          }}
        >
          Tips e Análises{" "}
          <span
            style={{
              background:           "linear-gradient(135deg, #F7D070, #F0B429)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}
          >
            com Valor
          </span>
          <br />
          Esperado Positivo
        </h1>

        {/* Subtítulo */}
        <p
          className="mb-8 leading-relaxed text-[#7D8FA3]"
          style={{ fontSize: "clamp(14px, 2vw, 16px)", maxWidth: 520 }}
        >
          Apostas esportivas baseadas em dados reais — odd justa, stake
          correto e histórico 100% transparente. Futebol, NBA, NFL e mais.
        </p>

        {/* CTAs */}
        <div className="flex flex-col xs:flex-row gap-3 mb-10 sm:mb-12">

          {/* CTA primário */}
          <Link
            href="/tips"
            className="group inline-flex items-center justify-center gap-2 rounded-[10px] font-bold transition-all duration-150 active:scale-[.97]"
            style={{
              height:     48,
              padding:    "0 24px",
              fontSize:   14,
              background: "#F0B429",
              color:      "#000",
              fontFamily: "'Oswald', Georgia, serif",
              letterSpacing: "0.4px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#F7D070")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#F0B429")
            }
          >
            {/* Ícone raio */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
            </svg>
            Tips do Dia
          </Link>

          {/* CTA secundário */}
          <Link
            href="/bolao/login"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all duration-150 active:scale-[.97]"
            style={{
              height:      48,
              padding:     "0 24px",
              fontSize:    14,
              background:  "#1C2430",
              color:       "#C8D3E0",
              border:      "1px solid #1E2D3D",
              fontFamily:  "'Oswald', Georgia, serif",
              letterSpacing: "0.4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background    = "#232E3C";
              e.currentTarget.style.borderColor   = "#253545";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background    = "#1C2430";
              e.currentTarget.style.borderColor   = "#1E2D3D";
            }}
          >
            {/* Ícone troféu */}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
              <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
              <path d="M12 17v4" />
              <path d="M8 21h8" />
              <rect x="6" y="2" width="12" height="13" rx="2" />
            </svg>
            Entrar no Bolão
          </Link>

        </div>

        {/* ── Cards de estatísticas ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-[480px]">
          {STATS.map(({ value, label, detail }) => (
            <StatCard
              key={label}
              value={value}
              label={label}
              detail={detail}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

// ── Sub-componente: card de estatística ───────────────────────────────────────
interface StatCardProps {
  value:  string;
  label:  string;
  detail: string;
}

function StatCard({ value, label, detail }: StatCardProps) {
  return (
    <div
      className="flex flex-col rounded-xl p-3 sm:p-4"
      style={{
        background: "#141A22",
        border:     "1px solid #1E2D3D",
      }}
    >
      {/* Valor numérico */}
      <span
        className="leading-none mb-1.5 tabular-nums"
        style={{
          fontFamily:  "'Oswald', Georgia, serif",
          fontSize:    "clamp(18px, 4vw, 24px)",
          fontWeight:  700,
          color:       "#F0B429",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </span>

      {/* Label principal */}
      <span
        className="font-semibold leading-tight mb-1"
        style={{
          fontSize: "clamp(10px, 2vw, 12px)",
          color:    "#C8D3E0",
        }}
      >
        {label}
      </span>

      {/* Detalhe secundário */}
      <span
        style={{
          fontSize: "clamp(9px, 1.8vw, 11px)",
          color:    "#4A5A6B",
        }}
      >
        {detail}
      </span>
    </div>
  );
}
