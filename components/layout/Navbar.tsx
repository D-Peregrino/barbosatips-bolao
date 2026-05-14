"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const NAV_LINKS = [
  { href: "/tips", label: "Tips" },
  { href: "/picks", label: "Picks" },
  { href: "/performance", label: "Performance" },
  { href: "/analises", label: "Análises" },
  { href: "/premium",  label: "Premium" },
  { href: "/bolao",    label: "Bolão" },
  { href: "/ranking",  label: "Ranking" },
  { href: "/guias",    label: "Guias" },
];

export function Navbar() {
  const pathname    = usePathname();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detecta scroll para adicionar blur
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Fecha menu mobile ao navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
        scrolled
          ? "bg-pitch-900/95 backdrop-blur-md border-b border-pitch-700 shadow-card"
          : "bg-pitch-900/80 backdrop-blur-sm border-b border-transparent",
      )}
    >
      <div className="container-site h-full flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label={siteConfig.name}
        >
          {/* Escudo da marca */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-pitch-950 text-sm font-bold font-display"
            style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)" }}
            aria-hidden
          >
            BT
          </div>
          <span className="font-display font-bold text-lg text-white tracking-wide group-hover:text-gold transition-colors duration-200">
            Barbosa<span className="text-gold">Tips</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "text-gold bg-gold/10"
                  : "text-neutral-400 hover:text-white hover:bg-pitch-700",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + Auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/bolao" className="btn-ghost text-sm px-3 py-2">
            + Bolão
          </Link>
          <Link href="/bolao/login" className="btn-primary text-xs px-4 py-2">
            Entrar
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden btn-icon text-neutral-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div
          className="md:hidden bg-pitch-900 border-t border-pitch-700 animate-slide-down"
          aria-label="Menu mobile"
        >
          <nav className="container-site py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "text-gold bg-gold/10"
                    : "text-neutral-400 hover:text-white hover:bg-pitch-700",
                )}
              >
                {label}
              </Link>
            ))}

            <div className="mt-3 pt-3 border-t border-pitch-700 flex gap-3">
              <Link href="/bolao" className="btn-secondary flex-1 justify-center py-2.5">
                + Bolão
              </Link>
              <Link href="/bolao/login" className="btn-primary flex-1 justify-center py-2.5">
                Entrar
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
