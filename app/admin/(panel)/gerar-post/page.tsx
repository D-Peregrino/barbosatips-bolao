import type { Metadata } from "next";
import { Share2 } from "lucide-react";
import { AdminGerarPostPanel } from "@/components/admin/social-posts/AdminGerarPostPanel";
import { siteConfig } from "@/config/site";
import { loadGerarPostPageData } from "@/lib/social-posts/load-gerar-post-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Gerar Post · Admin · ${siteConfig.shortTitle}`,
  robots: { index: false, follow: false },
};

export default async function AdminGerarPostPage() {
  const data = await loadGerarPostPageData();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
          Distribuição
        </p>
        <div className="mt-2 flex items-start gap-3">
          <Share2 className="mt-1 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Gerar Post
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
              Transforma picks e análises em textos prontos para Instagram, Telegram e X —
              com hashtags e botão copiar. Escolhe o modelo, ajusta a fonte e publica.
            </p>
          </div>
        </div>
      </header>

      <AdminGerarPostPanel data={data} />
    </div>
  );
}
