import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";

const EXTRA_HUBS: { href: string; label: string; icon: string; blurb: string }[] = [
  { href: "/basquete/nba", label: "NBA", icon: "🏀", blurb: "Linhas NBA · picks e hubs" },
];

export function HomeSportsHub() {
  return (
    <section aria-labelledby="home-sports-hub">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400/95">
            Explorar por esporte
          </p>
          <h2
            id="home-sports-hub"
            className="mt-1 font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl"
          >
            Hub <span className="text-gold-gradient">esportivo</span>
          </h2>
        </div>
        <Link
          href="/futebol"
          className="text-sm font-semibold text-gold-300 underline-offset-2 hover:underline"
        >
          Abrir futebol →
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {siteConfig.sports.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/${s.slug}`}
              className="commercial-card-elevated group flex items-center gap-4 rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/28"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gold-400/15 bg-black/50 text-2xl">
                {s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-cream">{s.label}</p>
                <p className="mt-0.5 text-xs text-stone-500">Análises, picks e estatísticas</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-stone-600 transition group-hover:text-gold-300" aria-hidden />
            </Link>
          </li>
        ))}
        {EXTRA_HUBS.map((x) => (
          <li key={x.href}>
            <Link
              href={x.href}
              className="commercial-card-elevated group flex items-center gap-4 rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/28"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gold-400/15 bg-black/50 text-2xl">
                {x.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-cream">{x.label}</p>
                <p className="mt-0.5 text-xs text-stone-500">{x.blurb}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-stone-600 transition group-hover:text-gold-300" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
