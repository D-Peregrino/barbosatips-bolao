/**
 * Atalhos de navegação quando não há sessão do participante no bolão
 * (ex.: localStorage limpo). Usa `<a href>` para garantir navegação mesmo
 * se o roteador client-side falhar.
 */
export function BolaoSessaoRecoveryPanel({
  mensagem,
  detalhe,
}: {
  mensagem?: string;
  detalhe?: string;
}) {
  const baseBtn =
    "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.08em] transition sm:flex-none sm:px-6 sm:text-xs";

  return (
    <div className="mx-auto mt-6 max-w-md rounded-xl border border-zinc-800 bg-[#111] p-5 text-left shadow-lg sm:p-6">
      <p className="text-sm font-bold text-yellow-400/95">
        {mensagem ?? "Sessão não encontrada neste dispositivo"}
      </p>
      {detalhe ? (
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">{detalhe}</p>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href="/bolao"
          className={`${baseBtn} border-[#C9A227]/50 bg-gradient-to-r from-[#e8c96b]/90 via-[#d4af37]/90 to-[#b8922b]/90 text-black hover:brightness-105`}
        >
          Fazer inscrição
        </a>
        <a
          href="/bolao/login"
          className={`${baseBtn} border-zinc-600 bg-zinc-900 text-zinc-200 hover:border-[#C9A227]/40 hover:text-[#F0D78C]`}
        >
          Entrar
        </a>
      </div>
    </div>
  );
}
