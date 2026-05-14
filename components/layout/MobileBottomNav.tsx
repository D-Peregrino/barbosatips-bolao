"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Crown, Home, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomItem = {
  href: string;
  label: string;
  icon: typeof Home;
  match: (_path: string) => boolean;
  labelAccent?: string;
  linkTitle?: string;
};

const ITEMS: BottomItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/picks", label: "Picks", icon: Zap, match: (p: string) => p.startsWith("/picks") || p.startsWith("/pick/") },
  {
    href: "/analises",
    label: "Análises",
    icon: BookOpen,
    match: (p: string) => p.startsWith("/analises") || p.startsWith("/analise/"),
  },
  { href: "/bolao", label: "Bolão", icon: Trophy, match: (p: string) => p.startsWith("/bolao") },
  {
    href: "/dashboard",
    label: "Perfil",
    labelAccent: "VIP",
    icon: Crown,
    linkTitle: "Perfil, feed e programa VIP",
    match: (p: string) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/meu-feed") ||
      p.startsWith("/vip") ||
      p.startsWith("/premium") ||
      p.startsWith("/login"),
  },
];

/**
 * Navegação inferior fixa (mobile) — ícones + texto, contraste elevado.
 * Desktop: oculto (≥ md).
 */
export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[85] border-t border-gold-400/20 bg-[#080807]/96 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-12px_40px_-28px_rgba(0,0,0,0.75)] backdrop-blur-xl md:hidden"
      aria-label="Navegação principal mobile"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-0.5 pt-1">
        {ITEMS.map(({ href, label, labelAccent, linkTitle, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                title={linkTitle}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition duration-200 active:scale-[0.97]",
                  active ? "text-gold-100" : "text-zinc-300 hover:text-zinc-100",
                )}
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] shrink-0 stroke-[2.1]",
                    active ? "text-gold-300" : "text-zinc-400",
                  )}
                  aria-hidden
                />
                {labelAccent ? (
                  <span className="flex flex-col items-center leading-[1.05]">
                    <span>{label}</span>
                    <span
                      className={cn(
                        "mt-px text-[8px] font-extrabold uppercase tracking-[0.14em]",
                        active ? "text-gold-400/95" : "text-gold-500/75",
                      )}
                    >
                      {labelAccent}
                    </span>
                  </span>
                ) : (
                  <span>{label}</span>
                )}
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
