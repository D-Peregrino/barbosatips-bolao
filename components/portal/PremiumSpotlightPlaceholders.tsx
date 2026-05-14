import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Grelha placeholder quando ainda não há análises premium — evita “buraco” na home.
 */
export function PremiumSpotlightPlaceholders() {
  const slots = [
    {
      title: "Zona VIP editorial",
      body: "Análises longas com capa widescreen, blocos estatísticos e leitura de mercado.",
    },
    {
      title: "Arquivo em construção",
      body: "Novos confrontos premium entram assim que a equipa editorial publicar.",
    },
    {
      title: "Antecipa o acesso",
      body: "Programa Premium e benefícios da comunidade — fica na fila certa.",
    },
  ] as const;

  return (
    <section
      className="relative rounded-2xl border border-dashed border-gold-400/25 bg-gradient-to-b from-black/50 via-pitch-950/90 to-[#030201] px-4 py-12 sm:px-6 sm:py-14"
      aria-labelledby="premium-spotlight-placeholder"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(201,162,39,0.08),transparent_55%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400/95">
            BarbosaTips Premium
          </p>
          <h2
            id="premium-spotlight-placeholder"
            className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Zona <span className="text-gold-gradient">premium</span>{" "}
            <span className="text-stone-500">· em preparação</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-stone-300 sm:mx-0">
            Ainda não há análises premium listadas — isto é normal num beta. Quando existirem,
            aparecem aqui em destaque. Entretanto, segue o canal e garante o primeiro aviso.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link
              href="/premium"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-300 px-6 text-sm font-bold text-pitch-950 shadow-gold-sm transition hover:brightness-105"
            >
              <Crown className="h-4 w-4" aria-hidden />
              Ver Premium
            </Link>
            <Link
              href="/analises"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-gold-400/25 px-6 text-sm font-semibold text-gold-100 transition hover:border-gold-300/45"
            >
              Análises públicas
            </Link>
          </div>
        </div>

        <ul className="grid gap-5 sm:grid-cols-3">
          {slots.map((s) => (
            <li key={s.title}>
              <div className="flex h-full flex-col rounded-2xl border border-gold-400/12 bg-black/35 p-5 text-left shadow-inner">
                <div className="mb-3 flex items-center gap-2 text-gold-200/90">
                  <Lock className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-400/80">
                    Brevemente
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-cream">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-400">{s.body}</p>
                <a
                  href={siteConfig.hub.telegramCanal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-xs font-semibold text-[#54b4e8] underline-offset-2 hover:underline"
                >
                  Aviso no Telegram →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
