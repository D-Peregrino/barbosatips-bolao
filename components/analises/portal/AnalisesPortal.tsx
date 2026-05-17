import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { AnaliseRow } from "@/lib/analises/types";
import { AnaliseCardGrid } from "@/components/analises/portal/AnaliseCardGrid";
import { AnalisesCommunityDeck } from "@/components/community/AnalisesCommunityDeck";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { siteConfig } from "@/config/site";
import { relativeTimeAgoPt } from "@/lib/live/time-ago";
import { BrandShield } from "@/components/brand/BrandShield";

type Props = {
  analises: AnaliseRow[];
  viewerCanViewPremium?: boolean;
};

function analiseTime(a: AnaliseRow): number {
  const t = Date.parse(a.created_at);
  return Number.isFinite(t) ? t : 0;
}

function ordenarDestaques(a: AnaliseRow, b: AnaliseRow): number {
  if (Number(b.destaque_principal) !== Number(a.destaque_principal)) {
    return Number(b.destaque_principal) - Number(a.destaque_principal);
  }
  if (b.prioridade !== a.prioridade) return b.prioridade - a.prioridade;
  return analiseTime(b) - analiseTime(a);
}

function subtituloAnalise(a: AnaliseRow): string {
  return a.mercado?.trim() || a.resumo?.trim() || "Leitura editorial BarbosaTips";
}

function destaqueMeta(a: AnaliseRow): string {
  return `DESTAQUE · ${(a.campeonato || a.tags || a.categoria || "Editorial").toUpperCase()}`;
}

function AnaliseDestaqueCard({ analise }: { analise: AnaliseRow }) {
  const capa = analise.imagem_url?.trim() || analise.imagem_capa?.trim();
  const quando = relativeTimeAgoPt(analise.created_at);
  const confianca = Number.isFinite(analise.confianca) && analise.confianca > 0
    ? `Confiança ${analise.confianca}%`
    : "Confiança editorial";

  return (
    <Link
      href={`/analise/${encodeURIComponent(analise.slug)}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-[#C9A227]/18 bg-[#080706]/95 shadow-[0_22px_60px_-34px_rgba(0,0,0,.95)] transition duration-300 hover:-translate-y-1 hover:border-[#C9A227]/45 hover:shadow-[0_28px_80px_-36px_rgba(201,162,39,.22)]"
    >
      <div className="relative h-[220px] overflow-hidden rounded-t-3xl bg-[#0c0b09]">
        {capa ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- capa editorial externa/dinâmica */}
            <img
              src={capa}
              alt={analise.titulo}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          </>
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 75% 80% at 50% 105%, rgba(201,162,39,.2), transparent 60%), linear-gradient(145deg, #12100c 0%, #050403 55%, #0a0908 100%)",
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 texture-club opacity-45" aria-hidden />
            <div className="relative flex flex-col items-center gap-3 text-center">
              <BrandShield size="lg" glow="soft" decorative />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A227]/90">
                BarbosaTips
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A227]/90">
          {destaqueMeta(analise)}
        </p>
        <h3 className="mt-3 line-clamp-2 font-display text-xl font-bold leading-tight text-white">
          {analise.titulo}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-zinc-300">
          {subtituloAnalise(analise)}
        </p>
        <p className="mt-auto pt-5 text-xs font-medium text-zinc-500">
          {quando} <span className="text-zinc-700">·</span> {confianca}
        </p>
      </div>
    </Link>
  );
}

export function AnalisesPortal({
  analises,
  viewerCanViewPremium = true,
}: Props) {
  if (analises.length === 0) {
    return (
      <PortalEmptyState
        icon={Newspaper}
        title="Análises em breve"
        description="Ainda não há prognósticos publicados nesta secção. Explora as picks rápidas, segue a comunidade no Telegram ou assiste às leituras em vídeo no YouTube."
        primaryHref="/picks"
        primaryLabel="Ver picks"
        secondaryHref="/comunidade"
        secondaryLabel="Entrar na comunidade"
        tertiaryHref={siteConfig.hub.youtubeCanalUrl}
        tertiaryLabel="Assistir no YouTube"
        quaternaryHref="/bolao"
        quaternaryLabel="Participar do bolão"
      />
    );
  }

  const destaques = [...analises].sort(ordenarDestaques).slice(0, 4);
  const destaqueIds = new Set(destaques.map((a) => a.id));
  const ultimas = analises.filter((a) => !destaqueIds.has(a.id));

  return (
    <div className="min-w-0 space-y-10">
      <section aria-labelledby="analises-destaques-heading">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#2a2418]/90 pb-4">
          <h2
            id="analises-destaques-heading"
            className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl"
          >
            Destaques
          </h2>
          <Link
            href="#ultimas-analises"
            className="shrink-0 text-xs font-black uppercase tracking-[0.14em] text-[#C9A227] transition hover:text-[#E8D48B]"
          >
            Ver todas →
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {destaques.map((a) => (
            <li key={a.id}>
              <AnaliseDestaqueCard analise={a} />
            </li>
          ))}
        </ul>
      </section>

      {ultimas.length > 0 ? (
        <section id="ultimas-analises" aria-labelledby="analises-grid-heading">
          <div className="mb-5 flex flex-col gap-2 border-b border-[#2a2418]/90 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="analises-grid-heading"
                className="font-display text-xl font-bold text-white sm:text-2xl"
              >
                Últimas análises
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Odds, confiança e contexto para cada confronto.
              </p>
            </div>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {ultimas.map((a) => (
              <li key={a.id}>
                <AnaliseCardGrid
                  analise={a}
                  viewerCanViewPremium={viewerCanViewPremium}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AnalisesCommunityDeck />
    </div>
  );
}
