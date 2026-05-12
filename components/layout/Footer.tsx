import Link from "next/link";
import { siteConfig } from "@/config/site";

const FOOTER_LINKS = {
  "Apostas": [
    { href: "/tips",    label: "Tips do Dia" },
    { href: "/analises", label: "Análises" },
    { href: "/ranking", label: "Ranking Tipsters" },
    { href: "/guias",   label: "Guias de Apostas" },
  ],
  "Comunidade": [
    { href: "/bolao",        label: "Bolão" },
    { href: "/bolao/criar",  label: "Criar Bolão" },
    { href: "/dashboard",    label: "Minha Conta" },
  ],
  "Esportes": siteConfig.sports.slice(0, 4).map((s) => ({
    href:  `/${s.slug}`,
    label: s.label,
  })),
  "BarbosaTips": [
    { href: "/sobre",         label: "Sobre" },
    { href: "/contato",       label: "Contato" },
    { href: "/politica-privacidade", label: "Privacidade" },
    { href: "/termos",        label: "Termos de Uso" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pitch-950 border-t border-pitch-800 mt-16">
      <div className="container-site py-12">

        {/* Grid de links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-display font-semibold text-gold uppercase tracking-widest mb-4">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-500 hover:text-neutral-200 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divisor */}
        <div className="border-t border-pitch-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Logo + copyright */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-pitch-950 text-xs font-bold font-display"
                style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)" }}
              >
                BT
              </div>
              <p className="text-sm text-neutral-600">
                © {year} <span className="text-neutral-400">{siteConfig.name}</span>
              </p>
            </div>

            {/* Redes sociais */}
            <div className="flex items-center gap-4">
              {[
                { href: siteConfig.social.telegram,  label: "Telegram",  icon: "✈" },
                { href: siteConfig.social.twitter,   label: "Twitter",   icon: "𝕏" },
                { href: siteConfig.social.instagram,  label: "Instagram", icon: "◫" },
                { href: siteConfig.social.youtube,    label: "YouTube",   icon: "▶" },
              ].map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-pitch-800 flex items-center justify-center text-neutral-500 hover:text-gold hover:bg-pitch-700 transition-all text-sm"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Aviso legal */}
          <p className="mt-6 text-xs text-neutral-700 leading-relaxed max-w-2xl">
            ⚠️ Apostas esportivas envolvem risco. Jogue com responsabilidade. O BarbosaTips
            fornece análises informativas e não é responsável por decisões de apostas.
            18+ apenas. Verifique a legislação local antes de apostar.
          </p>
        </div>
      </div>
    </footer>
  );
}
