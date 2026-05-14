"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Trophy, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomItem = {
  href: string;
  label: string;
  icon: typeof Home;
  match: (_path: string) => boolean;
  linkTitle?: string;
};

const ITEMS: BottomItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { href: "/picks", label: "Picks", icon: Zap, match: (p) => p.startsWith("/picks") || p.startsWith("/pick/") },
  {
    href: "/analises",
    label: "Análises",
    icon: BookOpen,
    match: (p) => p.startsWith("/analises") || p.startsWith("/analise/"),
  },
  { href: "/bolao", label: "Bolão", icon: Trophy, match: (p) => p.startsWith("/bolao") },
  {
    href: "/comunidade",
    label: "Comunidade",
    icon: Users,
    linkTitle: "Telegram, YouTube e hub BarbosaTips",
    match: (p) => p.startsWith("/comunidade"),
  },
];

/**
 * Navegação inferior fixa (mobile) — ícones + texto, contraste elevado.
 * Beta: último atalho é Comunidade (hub público), não área de membros.
 * Desktop: oculto (≥ md).
 */
export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[85] border-t border-gold-400/20 bg-[#080807]/96 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-12px_40px_-28px_rgba(0,0,0,0.75)] backdrop-blur-xl md:hidden"
      aria-label="Navegação principal mobile"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1.5">
        {ITEMS.map(({ href, label, linkTitle, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                title={linkTitle}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold uppercase tracking-wide transition duration-200 active:scale-[0.97]",
                  active ? "text-gold-100" : "text-zinc-200 hover:text-zinc-50",
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 shrink-0 stroke-[2.1]",
                    active ? "text-gold-300" : "text-zinc-300",
                  )}
                  aria-hidden
                />
                <span className="line-clamp-2 max-w-[4.5rem] text-center leading-[1.05]">{label}</span>
                {active ? (
                  <span className="h-0.5 w-6 rounded-full bg-gradient-to-r from-gold-500/0 via-gold-300 to-gold-500/0" />
                ) : (
                  <span className="h-0.5 w-6" aria-hidden />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
