"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { BrandShield } from "@/components/brand/BrandShield";
import { NavbarAccountControls } from "@/components/layout/NavbarAccountControls";

const NAV_LINKS = [
  { href: "/tips", label: "Tips" },
  { href: "/picks", label: "Picks" },
  { href: "/live", label: "Live" },
  { href: "/performance", label: "Performance" },
  { href: "/analises", label: "Análises" },
  { href: "/premium", label: "Premium" },
  { href: "/vip", label: "VIP" },
  { href: "/bolao", label: "Bolão" },
  { href: "/ranking", label: "Ranking" },
  { href: "/guias", label: "Guias" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

      <div className="container-site flex h-full items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label={siteConfig.name}
        >
          <BrandShield size="sm" className="transition duration-300 group-hover:drop-shadow-[0_0_14px_rgba(201,162,39,0.35)]" />
          <span className="font-display text-lg font-bold tracking-wide text-cream transition-colors duration-200 group-hover:text-gold-200">
            Barbosa<span className="text-gold-gradient">Tips</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200",
                  active ? "text-gold-200" : "text-cream-muted hover:text-cream",
                )}
              >
                {active ? (
                  <span
                    className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-gold-500/0 via-gold-300 to-gold-500/0"
                    aria-hidden
                  />
                ) : null}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NavbarAccountControls />
          <Link
            href="/bolao"
            className="rounded-lg px-3 py-2 text-sm font-medium text-cream-muted transition hover:bg-white/[0.04] hover:text-cream"
          >
            Bolão
          </Link>
          <Link
            href="/bolao/login"
            className="rounded-lg border border-gold-400/35 bg-gold-400/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-wide text-gold-100 shadow-gold-sm transition hover:border-gold-300/50 hover:bg-gold-400/12"
          >
            Entrar
          </Link>
        </div>

        <button
          type="button"
          className="btn-icon text-cream-muted hover:text-cream md:hidden"
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
          className="animate-slide-down border-t border-gold-400/10 bg-black/92 backdrop-blur-xl md:hidden"
          aria-label="Menu mobile"
        >
          <nav className="container-site flex flex-col gap-0.5 py-4">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold-400/10 text-gold-100"
                      : "text-cream-muted hover:bg-white/[0.04] hover:text-cream",
                  )}
                >
                  {label}
                </Link>
              );
            })}

            <div className="mt-4 flex flex-col gap-3 border-t border-gold-400/10 pt-4">
              <div className="flex flex-wrap items-center gap-2 px-1">
                <NavbarAccountControls />
              </div>
              <div className="flex gap-2">
                <Link href="/bolao" className="btn-secondary flex-1 justify-center py-2.5 text-sm">
                  Bolão
                </Link>
                <Link href="/bolao/login" className="btn-primary flex-1 justify-center py-2.5 text-xs">
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
