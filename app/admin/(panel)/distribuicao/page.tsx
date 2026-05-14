import Link from "next/link";
import { Share2 } from "lucide-react";

export default function AdminDistribuicaoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
          Roadmap
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          Distribuição & canais
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Área reservada para parceiros, patrocínios, filas de conteúdo e expansão multi-canal.
          Neste MVP beta, usa o hub público da comunidade e os placeholders de anúncio no site até
          ligarmos CRM e AdSense com permissões finas.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-gold-400/20 bg-black/35 p-6">
        <div className="flex items-start gap-3">
          <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" aria-hidden />
          <div>
            <h2 className="font-display text-lg font-bold text-white">Próximos passos</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-stone-400">
              <li>Mapa de parceiros e slots de patrocínio (rails + banners).</li>
              <li>Integração Google AdSense / GAM com ambiente de staging.</li>
              <li>Automação de newsletter e Telegram a partir do mesmo painel.</li>
            </ul>
            <Link
              href="/comunidade"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gold-400/25 px-5 text-sm font-semibold text-gold-100 transition hover:border-gold-300/45"
            >
              Abrir hub comunidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
