import { BrandShield } from "@/components/brand/BrandShield";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 bg-[var(--color-void)] px-6 py-20">
      <div className="animate-brand-breathe">
        <BrandShield size="xl" glow="soft" priority decorative />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--color-cream-muted)]">
        A carregar
      </p>
    </div>
  );
}
