import Link from "next/link";
import { Crown } from "lucide-react";

type Props = {
  title: string;
  description: string;
};

export function PremiumGate({ title, description }: Props) {
  return (
    <section className="rounded-2xl border border-gold-400/20 bg-gradient-to-br from-gold-400/[0.08] via-black/80 to-black p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-400/30 bg-gold-400/[0.08] text-gold-200">
        <Crown className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">{description}</p>
      <Link
        href="/vip"
        className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 px-6 text-sm font-bold text-pitch-950 transition hover:brightness-105"
      >
        Assinar VIP Premium
      </Link>
    </section>
  );
}
