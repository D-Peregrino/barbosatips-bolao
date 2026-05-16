import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { AdminFootballApiPanel } from "@/components/admin/football-api/AdminFootballApiPanel";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `API-Football · Admin · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default function AdminFootballApiPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
          Dados externos
        </p>
        <div className="mt-2 flex items-start gap-3">
          <Radio className="mt-1 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              API-Football
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
              Consulta jogos do dia por campeonato, horário e placar. Escolhe um fixture para
              usar futuramente em análises editoriais — sem criar conteúdo automaticamente.
            </p>
          </div>
        </div>
      </header>

      <AdminFootballApiPanel />
    </div>
  );
}
