import Link from "next/link";
import { siteConfig } from "@/config/site";
import { BrandShield } from "@/components/brand/BrandShield";

const FOOTER_LINKS = {
  Apostas: [
    { href: "/tips", label: "Tips do Dia" },
    { href: "/picks", label: "Picks rápidas" },
    { href: "/analises", label: "Análises" },
    { href: "/premium", label: "Premium" },
    { href: "/ranking", label: "Ranking Tipsters" },
    { href: "/guias", label: "Guias de Apostas" },
  ],
  Comunidade: [
    { href: "/bolao", label: "Bolão" },
    { href: "/bolao", label: "Criar Bolão" },
    { href: "/meu-feed", label: "Meu feed" },
    { href: "/dashboard", label: "Minha Conta" },
  ],
  Esportes: siteConfig.sports.slice(0, 4).map((s) => ({
    href: `/${s.slug}`,
    label: s.label,
  })),
  BarbosaTips: [
    { href: "/sobre", label: "Sobre" },
    { href: "/contato", label: "Contato" },
    { href: "/politica-privacidade", label: "Privacidade" },
    { href: "/termos", label: "Termos de Uso" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-gold-400/10 bg-gradient-to-b from-pitch-950 to-[var(--color-void)]">
      <div className="container-site py-14">
        <div className="mb-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-[11px] font-display font-semibold uppercase tracking-[0.22em] text-gold-400/95">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={`${section}-${href}-${label}`}>
                    <Link
                      href={href}
                      className="text-sm text-stone-500 transition-colors hover:text-gold-200/90"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gold-400/10 pt-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <BrandShield size="xs" decorative />
              <p className="text-sm text-stone-500">
                © {year}{" "}
                <span className="font-medium text-cream-muted">{siteConfig.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { href: siteConfig.social.telegram, label: "Telegram", icon: "✈" },
                { href: siteConfig.social.twitter, label: "Twitter", icon: "𝕏" },
                { href: siteConfig.social.instagram, label: "Instagram", icon: "◫" },
                { href: siteConfig.social.youtube, label: "YouTube", icon: "▶" },
              ].map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-400/10 bg-pitch-900/80 text-sm text-stone-500 transition hover:border-gold-400/25 hover:text-gold-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-stone-600">
            Apostas esportivas envolvem risco. Jogue com responsabilidade. O BarbosaTips fornece
            análises informativas e não é responsável por decisões de apostas. 18+ apenas.
            Verifique a legislação local antes de apostar.
          </p>
        </div>
      </div>
    </footer>
  );
}
