import Link from "next/link";
import {
  Activity,
  FilePlus,
  LineChart,
  PenLine,
  Send,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { siteConfig } from "@/config/site";

type Card = {
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: typeof PenLine;
  external?: boolean;
};

const CARDS: Card[] = [
  {
    title: "Editorial",
    body: "Listar, editar e publicar análises no CMS.",
    href: "/admin-editorial",
    cta: "Abrir editorial",
    icon: PenLine,
  },
  {
    title: "Nova análise",
    body: "Criar análise editorial com capa, blocos e IA assistente.",
    href: "/admin-editorial/nova",
    cta: "Criar análise",
    icon: FilePlus,
  },
  {
    title: "Picks",
    body: "Inserir e gerir quick picks com odd e confiança.",
    href: "/admin-picks",
    cta: "Abrir picks",
    icon: Zap,
  },
  {
    title: "Bolão",
    body: "Painel do bolão com sessão própria (inalterado).",
    href: "/admin/bolao",
    cta: "Ir ao bolão admin",
    icon: Trophy,
  },
  {
    title: "Ranking",
    body: "Classificação pública do bolão — pré-visualização.",
    href: "/ranking",
    cta: "Ver ranking",
    icon: Trophy,
    external: true,
  },
  {
    title: "Performance",
    body: "Métricas públicas de ROI e taxa de acerto.",
    href: "/performance",
    cta: "Ver performance",
    icon: Activity,
    external: true,
  },
  {
    title: "Comunidade",
    body: "Hub Telegram, YouTube e CTAs da comunidade.",
    href: "/comunidade",
    cta: "Abrir comunidade",
    icon: Users,
    external: true,
  },
  {
    title: "Distribuição",
    body: "Canais, parceiros e expansão multi-canal.",
    href: "/admin/distribuicao",
    cta: "Ver distribuição",
    icon: Send,
  },
  {
    title: "Operacional",
    body: "Checklists, rotas e estado interno do produto.",
    href: "/operacional",
    cta: "Abrir operacional",
    icon: LineChart,
  },
];

function adminCardsVisiveis(): Card[] {
  if (!siteConfig.betaLaunch.enabled) return CARDS;
  const ocultas = new Set<string>([...siteConfig.betaLaunch.redirectToHomePrefixes]);
  return CARDS.filter((c) => !ocultas.has(c.href));
}

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function AdminDashboardPage({ searchParams }: Props) {
  const mod = typeof searchParams.mod === "string" ? searchParams.mod : undefined;
  const modLabel =
    mod === "editorial"
      ? "Editorial"
      : mod === "picks"
        ? "Picks"
        : mod === "leads"
          ? "Leads"
          : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Painel central
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
          Atalhos para todos os módulos administrativos. Sessão única com email e senha (Supabase
          Auth) — apenas contas com <code className="text-gold-200/90">role=admin</code>.
        </p>
        {modLabel ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-100">
            Redirecionado de: <span className="text-white">{modLabel}</span>
          </p>
        ) : null}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminCardsVisiveis().map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex h-full flex-col rounded-2xl border border-gold-400/12 bg-gradient-to-b from-[#0f0d08]/95 to-black/80 p-5 shadow-[0_20px_50px_-36px_rgba(0,0,0,0.85)] transition hover:border-gold-400/28 hover:shadow-[0_24px_60px_-32px_rgba(201,162,39,0.12)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-400/15 bg-gold-400/5 text-gold-200 transition group-hover:border-gold-400/30">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-white">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-400">{c.body}</p>
              <span className="mt-4 text-sm font-bold text-gold-300 group-hover:underline">
                {c.cta} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
