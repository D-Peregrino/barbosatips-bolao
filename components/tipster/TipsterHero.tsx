import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PublicTipsterProfile } from "@/config/tipsters";
import { tipsterSportsLabels } from "@/config/tipsters";
import { BrandShield } from "@/components/brand/BrandShield";
import { FollowToggleButton } from "@/components/engagement/FollowToggleButton";

type Props = {
  profile: PublicTipsterProfile;
};

export function TipsterHero({ profile }: Props) {
  const sports = tipsterSportsLabels(profile);
  const avatar = profile.avatarUrl?.trim();

  return (
    <section className="relative isolate overflow-hidden border-b border-gold-400/12">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a07] via-[#050403] to-[#080706]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_0%,rgba(201,162,39,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 texture-club opacity-45" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1fr_280px] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400/95">
            Perfil público
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl lg:text-5xl">
            {profile.displayName}
          </h1>
          <p className="mt-2 text-sm font-medium text-gold-200/90 sm:text-base">{profile.tagline}</p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-stone-500 sm:text-base">{profile.bio}</p>

          <div className="mt-6 rounded-2xl border border-gold-400/15 bg-black/35 px-4 py-3 sm:inline-block sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Especialidade</p>
            <p className="mt-1 text-sm font-semibold text-cream-muted">{profile.especialidade}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {sports.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/20 bg-gold-400/[0.06] px-3 py-1.5 text-xs font-semibold text-gold-100 transition hover:border-gold-300/40"
              >
                <span aria-hidden>{s.icon}</span>
                {s.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <FollowToggleButton kind="tipster" refKey={profile.slug} showLabel label={`Seguir ${profile.displayName}`} />
            <Link
              href="/picks"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 px-5 py-2.5 text-sm font-bold text-pitch-950 shadow-gold-sm transition hover:brightness-105"
            >
              Ver picks
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/analises"
              className="inline-flex items-center gap-2 rounded-xl border border-gold-400/35 bg-black/40 px-5 py-2.5 text-sm font-semibold text-gold-100 transition hover:border-gold-300/50"
            >
              Análises
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="commercial-card-elevated relative flex aspect-square w-full max-w-[260px] flex-col items-center justify-center rounded-3xl border p-8">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={200}
                height={200}
                sizes="(max-width: 1024px) 45vw, 260px"
                className="h-40 w-40 object-contain drop-shadow-[0_0_28px_rgba(201,162,39,0.22)]"
                priority
                unoptimized={avatar.endsWith(".svg")}
              />
            ) : (
              <BrandShield size="xl" glow="medium" priority decorative />
            )}
            <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-gold-400/90">
              {profile.displayName}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
