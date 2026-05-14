import type { AnaliseRow } from "@/lib/analises/types";

type Props = {
  analise: AnaliseRow;
  /** Proporção da área de mídia (Tailwind aspect-* ou classe custom) */
  aspectClass?: string;
  /** Altura mínima em hero */
  minHeightClass?: string;
};

/**
 * Imagem de capa ou placeholder premium (dark + gold BarbosaTips).
 */
export function AnaliseCapaMedia({
  analise,
  aspectClass = "aspect-[16/10]",
  minHeightClass,
}: Props) {
  const hasCapa = Boolean(analise.imagem_capa?.trim());

  if (hasCapa) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-zinc-950 ${aspectClass} ${minHeightClass ?? ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URLs externas dinâmicas */}
        <img
          src={analise.imagem_capa}
          alt={analise.titulo}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden bg-[#080706] ${aspectClass} ${minHeightClass ?? ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 120%, rgba(212,175,55,.18), transparent 55%), linear-gradient(165deg, #12100c 0%, #050608 45%, #0a0908 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-12deg, transparent, transparent 12px, rgba(201,162,39,.08) 12px, rgba(201,162,39,.08) 13px)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-2 px-6 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C9A227]/35 bg-[#C9A227]/10 text-2xl font-black text-[#E8D48B] shadow-[0_0_40px_-8px_rgba(212,175,55,.45)]"
          aria-hidden
        >
          BT
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A227]/90">
          Prognóstico
        </p>
        <p className="max-w-[14rem] text-xs font-medium leading-snug text-zinc-500">
          {analise.time_casa} × {analise.time_fora}
        </p>
      </div>
    </div>
  );
}
