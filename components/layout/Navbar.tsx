"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { BrandShield } from "@/components/brand/BrandShield";
import { NavbarAccountControls } from "@/components/layout/NavbarAccountControls";

/** Navegação principal desktop — portal esportivo, sempre visível (md+). */
const PRIMARY_NAV = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/picks", label: "Picks", match: (p: string) => p.startsWith("/picks") || p.startsWith("/pick/") },
  {
    href: "/analises",
    label: "Análises",
    match: (p: string) => p.startsWith("/analises") || p.startsWith("/analise/"),
  },
  { href: "/performance", label: "Performance", match: (p: string) => p.startsWith("/performance") },
  {
    href: "/inteligencia",
    label: "Inteligência",
    match: (p: string) => p.startsWith("/inteligencia"),
  },
  { href: "/bolao", label: "Bolão", match: (p: string) => p.startsWith("/bolao") },
  { href: "/vip", label: "VIP", match: (p: string) => p.startsWith("/vip") || p.startsWith("/premium") },
] as const;

/** Secções extra — acessíveis pelo menu “Mais” (desktop) e no drawer mobile. */
const MORE_NAV = [
  { href: "/tips", label: "Tips" },
  { href: "/live", label: "Live" },
  { href: "/premium", label: "Premium" },
  { href: "/ranking", label: "Ranking" },
  { href: "/guias", label: "Guias" },
  { href: "/comunidade", label: "Comunidade" },
  { href: "/newsletter", label: "Newsletter" },
] as const;

const MOBILE_DRAWER_LINKS = [
  ...PRIMARY_NAV.map(({ href, label, match }) => ({ href, label, match })),
  ...MORE_NAV.map(({ href, label }) => ({
    href,
    label,
    match: (p: string) => p === href || p.startsWith(`${href}/`),
  })),
] as const;

function moreMenuActive(pathname: string): boolean {
  return MORE_NAV.some(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const maisHighlighted = moreMenuActive(pathname);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
        scrolled
          ? "border-b border-gold-400/12 bg-black/82 backdrop-blur-xl shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)]"
          : "border-b border-transparent bg-gradient-to-b from-black/75 to-black/20 backdrop-blur-md",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />

      <div className="container-site flex h-full min-w-0 items-center justify-between gap-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3" aria-label={siteConfig.name}>
          <BrandShield
            size="sm"
            priority
            className="transition duration-300 group-hover:drop-shadow-[0_0_14px_rgba(201,162,39,0.35)]"
          />
          <span className="font-display text-base font-bold tracking-wide text-cream transition-colors duration-200 group-hover:text-gold-200 sm:text-lg">
            Barbosa<span className="text-gold-gradient">Tips</span>
          </span>
        </Link>

        {/* Desktop: portal principal + Mais */}
        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <nav className="flex max-w-full items-center justify-center gap-0.5 lg:gap-1" aria-label="Navegação principal">
            {PRIMARY_NAV.map(({ href, label, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative whitespace-nowrap rounded-lg px-2 py-2 text-[12px] font-semibold tracking-wide transition-colors duration-200 lg:px-3 lg:text-[13px]",
                    active ? "text-gold-100" : "text-zinc-200 hover:text-cream",
                  )}
                >
                  {active ? (
                    <span
                      className="absolute inset-x-1.5 bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-gold-500/0 via-gold-300 to-gold-500/0"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative">{label}</span>
                </Link>
              );
            })}

            <div className="relative pl-0.5" ref={moreRef}>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-0.5 rounded-lg px-2 py-2 text-[12px] font-semibold tracking-wide transition-colors duration-200 lg:px-3 lg:text-[13px]",
                  maisHighlighted || moreOpen
                    ? "text-gold-100"
                    : "text-zinc-200 hover:text-cream",
                )}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                aria-controls="nav-mais-menu"
                id="nav-mais-button"
                onClick={() => setMoreOpen((v) => !v)}
              >
                Mais
                <ChevronDown
                  className={cn("h-3.5 w-3.5 opacity-80 transition-transform", moreOpen && "rotate-180")}
                  aria-hidden
                />
              </button>

              {moreOpen ? (
                <div
                  id="nav-mais-menu"
                  role="menu"
                  aria-labelledby="nav-mais-button"
                  className="absolute right-0 top-full z-50 mt-1 min-w-[11.5rem] rounded-xl border border-gold-400/18 bg-[#0a0908]/96 py-1.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                >
                  {MORE_NAV.map(({ href, label }) => {
                    const active = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        className={cn(
                          "block px-4 py-2.5 text-[13px] font-medium transition-colors",
                          active ? "bg-gold-400/10 text-gold-100" : "text-zinc-200 hover:bg-white/[0.06] hover:text-cream",
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <NavbarAccountControls />
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.05] hover:text-cream"
          >
            Conta
          </Link>
          <Link
            href="/bolao/login"
            className="rounded-lg border border-gold-400/40 bg-gold-400/[0.1] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-gold-100 shadow-gold-sm transition hover:border-gold-300/55 hover:bg-gold-400/14"
          >
            Entrar
          </Link>
        </div>

        <button
          type="button"
          className="btn-icon text-zinc-300 hover:text-cream md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className="animate-slide-down max-h-[min(78vh,calc(100dvh-4rem))] overflow-y-auto overscroll-y-contain border-t border-gold-400/15 bg-black/95 backdrop-blur-xl md:hidden"
          aria-label="Menu mobile"
        >
          <nav className="container-site flex flex-col gap-0.5 py-4">
            {MOBILE_DRAWER_LINKS.map(({ href, label, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors",
                    active ? "bg-gold-400/12 text-gold-100" : "text-zinc-200 hover:bg-white/[0.05] hover:text-cream",
                  )}
                >
                  {label}
                </Link>
              );
            })}

            <div className="mt-4 flex flex-col gap-3 border-t border-gold-400/12 pt-4">
              <div className="flex flex-wrap items-center gap-2 px-1">
                <NavbarAccountControls />
              </div>
              <div className="flex gap-2">
                <Link href="/login" className="btn-secondary flex-1 justify-center py-2.5 text-sm font-semibold">
                  Conta
                </Link>
                <Link href="/bolao/login" className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold">
                  Entrar
                </Link>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
