import type { Metadata } from "next";
import Link from "next/link";
import { getHealthSnapshot } from "@/lib/ops/health";
import { getDeploymentChannel } from "@/config/environment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Status operacional",
  robots: { index: false, follow: false },
};

export default async function StatusPage() {
  const snapshot = await getHealthSnapshot();
  const channel = getDeploymentChannel();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-400/80">
        BarbosaTips · Operações
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-cream md:text-4xl">
        Estado do serviço
      </h1>
      <p className="mt-3 text-sm text-cream-muted">
        Página interna (noindex). Última verificação:{" "}
        <time dateTime={snapshot.timestamp}>{snapshot.timestamp}</time>
      </p>

      <div
        className={`mt-10 rounded-2xl border px-5 py-6 ${
          snapshot.ok
            ? "border-emerald-500/25 bg-emerald-500/5"
            : "border-loss/30 bg-loss/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
              snapshot.ok ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" : "bg-loss"
            }`}
            aria-hidden
          />
          <p className="font-display text-lg text-cream">
            {snapshot.ok ? "Sistema operacional" : "Degradação ou configuração incompleta"}
          </p>
        </div>
        <dl className="mt-6 grid gap-3 font-mono text-xs text-cream-muted sm:grid-cols-2">
          <div className="rounded-xl bg-pitch-900/80 px-3 py-2 ring-1 ring-white/5">
            <dt className="text-2xs uppercase tracking-wider text-gold-400/70">Canal</dt>
            <dd className="mt-1 text-sm text-cream">{channel}</dd>
          </div>
          <div className="rounded-xl bg-pitch-900/80 px-3 py-2 ring-1 ring-white/5">
            <dt className="text-2xs uppercase tracking-wider text-gold-400/70">Build</dt>
            <dd className="mt-1 truncate text-sm text-cream" title={snapshot.build.commit ?? ""}>
              {snapshot.build.env ?? "—"}
              {snapshot.build.commit ? ` · ${snapshot.build.commit.slice(0, 7)}` : ""}
            </dd>
          </div>
          <div className="rounded-xl bg-pitch-900/80 px-3 py-2 ring-1 ring-white/5">
            <dt className="text-2xs uppercase tracking-wider text-gold-400/70">Supabase URL</dt>
            <dd className="mt-1 text-sm text-cream">
              {snapshot.checks.supabaseUrl ? "definida" : "em falta"}
            </dd>
          </div>
          <div className="rounded-xl bg-pitch-900/80 px-3 py-2 ring-1 ring-white/5">
            <dt className="text-2xs uppercase tracking-wider text-gold-400/70">Chave anónima</dt>
            <dd className="mt-1 text-sm text-cream">
              {snapshot.checks.supabaseAnonKey ? "definida" : "em falta"}
            </dd>
          </div>
          <div className="sm:col-span-2 rounded-xl bg-pitch-900/80 px-3 py-2 ring-1 ring-white/5">
            <dt className="text-2xs uppercase tracking-wider text-gold-400/70">
              Auth health (live)
            </dt>
            <dd className="mt-1 text-sm text-cream">
              {snapshot.checks.supabaseReachable === null
                ? "não testado (modo offline ou skip)"
                : snapshot.checks.supabaseReachable
                  ? "alcançável"
                  : "indisponível ou timeout"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/api/health"
          className="inline-flex items-center justify-center rounded-xl border border-gold-400/35 bg-gold-400/10 px-4 py-2.5 text-sm font-medium text-gold-100 transition hover:bg-gold-400/15"
        >
          JSON /api/health
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm text-cream-muted transition hover:border-white/20 hover:text-cream"
        >
          Voltar ao site
        </Link>
      </div>
    </div>
  );
}
