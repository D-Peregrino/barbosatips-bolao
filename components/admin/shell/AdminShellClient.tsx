"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  FilePlus,
  LayoutDashboard,
  LineChart,
  Menu,
  PenLine,
  Radio,
  Send,
  Shield,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSairButton } from "@/components/admin/shell/AdminSairButton";
import type { AdminPanelShellSession } from "@/lib/admin/supabase-admin";

type NavItem = {
  href: string;
  label: string;
  desc: string;
  icon: typeof LayoutDashboard;
  external?: boolean;
};

const PRIMARY: NavItem[] = [
  { href: "/admin", label: "Painel", desc: "Visão geral", icon: LayoutDashboard },
  { href: "/admin-editorial", label: "Editorial", desc: "Listagem CMS", icon: PenLine },
  {
    href: "/admin-editorial/nova",
    label: "Nova análise",
    desc: "Criar conteúdo",
    icon: FilePlus,
  },
  { href: "/admin-picks", label: "Picks", desc: "Quick picks", icon: Zap },
  {
    href: "/admin/gerar-post",
    label: "Gerar Post",
    desc: "Redes sociais",
    icon: Send,
  },
  {
    href: "/admin/football-api",
    label: "API-Football",
    desc: "Jogos do dia",
    icon: Radio,
  },
  {
    href: "/admin/mercados",
    label: "Mercados EV+",
    desc: "Valor esperado",
    icon: TrendingUp,
  },
  {
    href: "/admin/mercados/resultados",
    label: "EV+ Resultados",
    desc: "Tracking liquidado",
    icon: LineChart,
  },
  {
    href: "/admin/admins",
    label: "Administradores",
    desc: "Acesso ao painel",
    icon: Shield,
  },
  { href: "/admin/bolao", label: "Bolão", desc: "Sessão própria", icon: Trophy },
];

const PORTAL: NavItem[] = [
  { href: "/ranking", label: "Ranking", desc: "Bolão público", icon: Trophy, external: true },
  {
    href: "/performance",
    label: "Performance",
    desc: "Métricas públicas",
    icon: Activity,
    external: true,
  },
  {
    href: "/comunidade",
    label: "Comunidade",
    desc: "Hub social",
    icon: Users,
    external: true,
  },
  { href: "/admin/distribuicao", label: "Distribuição", desc: "Canais", icon: Send },
  { href: "/operacional", label: "Operacional", desc: "Checklists", icon: LineChart },
];

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const clean = local.replace(/[^a-zA-Z0-9]/g, "");
  return (clean.slice(0, 2) || "BT").toUpperCase();
}

type Props = {
  session: AdminPanelShellSession;
  children: React.ReactNode;
};

export function AdminShellClient({ session, children }: Props) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  const lastLabel = formatDistanceToNow(new Date(session.lastAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const isActive = (href: string, external?: boolean) => {
    if (external) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkCls = (href: string, external?: boolean) =>
    cn(
      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      isActive(href, external)
        ? "bg-gold-400/12 text-gold-50 ring-1 ring-gold-400/25"
        : "text-stone-300 hover:bg-white/[0.04] hover:text-white",
    );

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-[min(100%,280px)] border-r border-gold-400/12 bg-[#080706]/98 px-4 py-6 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 lg:flex lg:w-64 lg:shrink-0 lg:translate-x-0 lg:flex-col lg:border-r lg:bg-[#080706]/95",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="mb-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500/25 to-amber-600/15 text-sm font-black text-gold-100 ring-1 ring-gold-400/25">
              {initialsFromEmail(session.email)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">Admin</p>
              <p className="truncate text-[11px] text-stone-500">{session.email}</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-200/95">
              Online
            </span>
          </div>
          <p className="mt-1 text-[11px] text-stone-400">
            Última atividade:{" "}
            <span className="text-stone-200" suppressHydrationWarning>
              {lastLabel}
            </span>
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pb-6" aria-label="Módulos admin">
          <div>
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
              Módulos
            </p>
            <ul className="space-y-0.5">
              {PRIMARY.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={linkCls(it.href)}
                    onClick={() => setOpen(false)}
                  >
                    <it.icon className="h-4 w-4 shrink-0 text-gold-300/90" aria-hidden />
                    <span className="min-w-0">
                      <span className="block leading-tight">{it.label}</span>
                      <span className="block text-[10px] font-normal text-stone-500 group-hover:text-stone-400">
                        {it.desc}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
              Portal & ops
            </p>
            <ul className="space-y-0.5">
              {PORTAL.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={linkCls(it.href, it.external)}
                    {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => setOpen(false)}
                  >
                    <it.icon className="h-4 w-4 shrink-0 text-gold-300/90" aria-hidden />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 leading-tight">
                        {it.label}
                        {it.external ? (
                          <Radio className="h-3 w-3 text-stone-500" aria-hidden />
                        ) : null}
                      </span>
                      <span className="block text-[10px] font-normal text-stone-500 group-hover:text-stone-400">
                        {it.desc}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4">
          <AdminSairButton variant="sidebar" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <header className="sticky top-16 z-40 flex items-center justify-between gap-3 border-b border-gold-400/10 bg-[#050504]/90 px-4 py-3 backdrop-blur-md lg:top-0 lg:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-stone-200 hover:bg-white/[0.04] lg:hidden"
            onClick={() => setOpen(true)}
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
              BarbosaTips
            </p>
            <p className="truncate font-display text-lg font-bold text-white">Painel central</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <AdminSairButton variant="header" className="shrink-0" />
            <span className="hidden rounded-full border border-gold-400/15 bg-gold-400/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-100/95 md:inline">
              Admin
            </span>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-500/30 to-amber-700/20 text-xs font-black text-gold-50 ring-1 ring-gold-400/20"
              title={session.email}
            >
              {initialsFromEmail(session.email)}
            </span>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
