import type { AnaliseRow } from "@/lib/analises/types";
import { BrandShield } from "@/components/brand/BrandShield";

type Props = {
  analise: AnaliseRow;
  /** Proporção da área de mídia (Tailwind aspect-* ou classe custom) */
  aspectClass?: string;
  /** Altura mínima em hero */
  minHeightClass?: string;
};

/**
 * Imagem de capa ou placeholder premium com escudo BarbosaTips.
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
        className={`relative w-full overflow-hidden bg-pitch-950 ${aspectClass} ${minHeightClass ?? ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URLs externas dinâmicas */}
        <img
          src={analise.imagem_capa}
          alt={analise.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden bg-pitch-950 ${aspectClass} ${minHeightClass ?? ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(ellipse 80% 85% at 50% 115%, rgba(201,162,39,.16), transparent 58%), linear-gradient(165deg, #0f0d08 0%, #050403 48%, #080706 100%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 texture-club opacity-50" aria-hidden />
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <BrandShield size="lg" glow="soft" decorative />
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold-400/90">
          Prognóstico
        </p>
        <p className="max-w-[14rem] text-xs font-medium leading-snug text-stone-500">
          {analise.time_casa} × {analise.time_fora}
        </p>
      </div>
    </div>
  );
}
