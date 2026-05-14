"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { MeuFeedPayload } from "@/lib/engagement/load-meu-feed";
import type { UserNotificationRow } from "@/lib/engagement/types";
import { markAllNotificationsRead, markNotificationRead, updateNotificationPrefs } from "@/actions/engagement";
import { PickCard } from "@/components/picks/PickCard";
import { AnaliseCardGrid } from "@/components/analises/portal/AnaliseCardGrid";
import { clearEngagementSnapshotCache } from "@/lib/engagement/client-snapshot";
import { viewerPodeVerPremium } from "@/lib/premium/types";
import type { PremiumAccess } from "@/lib/premium/types";

const TABS = [
  { id: "feed", label: "Feed" },
  { id: "favoritos", label: "Favoritos" },
  { id: "notifs", label: "Notificações" },
  { id: "historico", label: "Histórico" },
  { id: "prefs", label: "Preferências" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  initial: MeuFeedPayload;
  access: PremiumAccess;
  initialTab?: string | null;
};

function tabFromParam(tabParam: string | null | undefined): TabId {
  if (tabParam === "notifs" || tabParam === "notifications") return "notifs";
  if (tabParam === "favoritos") return "favoritos";
  if (tabParam === "prefs") return "prefs";
  if (tabParam === "historico") return "historico";
  return "feed";
}

export function MeuFeedClient({ initial, access, initialTab }: Props) {
  const [tab, setTab] = useState<TabId>(() => tabFromParam(initialTab));
  const [prefs, setPrefs] = useState(initial.prefs);
  const [notifs, setNotifs] = useState(initial.notifications);
  const [pending, startTransition] = useTransition();
  const canPremium = viewerPodeVerPremium(access);

  const historico = useMemo(() => {
    const rows: { t: string; label: string; href?: string }[] = [];
    for (const f of initial.favorites) {
      rows.push({
        t: f.created_at,
        label:
          f.kind === "analise"
            ? `Análise guardada · ${f.ref_id}`
            : `Pick guardada · ${f.ref_id.slice(0, 8)}…`,
        href: f.kind === "analise" ? `/analise/${encodeURIComponent(f.ref_id)}` : `/pick/${encodeURIComponent(f.ref_id)}`,
      });
    }
    for (const f of initial.follows) {
      rows.push({
        t: f.created_at,
        label:
          f.kind === "esporte"
            ? `Seguindo esporte · ${f.ref_key}`
            : f.kind === "campeonato"
              ? `Seguindo competição · ${f.ref_key}`
              : `Seguindo tipster · ${f.ref_key}`,
        href:
          f.kind === "esporte"
            ? `/${f.ref_key}`
            : f.kind === "campeonato"
              ? `/${f.ref_key}`
              : `/tipster/${encodeURIComponent(f.ref_key)}`,
      });
    }
    return rows.sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime());
  }, [initial.favorites, initial.follows]);

  const onMarkRead = useCallback((n: UserNotificationRow) => {
    startTransition(async () => {
      await markNotificationRead(n.id);
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      clearEngagementSnapshotCache();
    });
  }, []);

  const onMarkAll = useCallback(() => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifs((prev) => prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
      clearEngagementSnapshotCache();
    });
  }, []);

  const savePrefs = useCallback(() => {
    startTransition(async () => {
      if (!prefs) return;
      await updateNotificationPrefs({
        notify_new_analise: prefs.notify_new_analise,
        notify_new_pick: prefs.notify_new_pick,
        notify_pick_result: prefs.notify_pick_result,
        notify_hot_streak: prefs.notify_hot_streak,
        channel_push: prefs.channel_push,
        channel_email: prefs.channel_email,
        channel_telegram: prefs.channel_telegram,
      });
    });
  }, [prefs]);

  if (!initial.userId) {
    return (
      <div className="commercial-card-elevated mx-auto max-w-lg border p-8 text-center">
        <p className="font-display text-xl text-white">Inicia sessão</p>
        <p className="mt-2 text-sm text-zinc-500">O teu feed, favoritos e alertas ficam na conta Google do portal.</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-gold-300 to-gold-400 px-6 py-3 text-sm font-bold text-pitch-950"
        >
          Entrar na conta
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition duration-300",
              tab === t.id
                ? "bg-gold-400/20 text-gold-100 ring-1 ring-gold-400/40"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-cream",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "feed" ? (
        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="font-display text-lg font-bold text-white">Picks dos teus desportos</h2>
            <p className="mt-1 text-xs text-zinc-500">Até 24 linhas recentes dos esportes que segues.</p>
            <ul className="mt-4 grid gap-4">
              {initial.followedSportPicks.length === 0 ? (
                <li className="text-sm text-zinc-500">Segue um desporto no hub (botão &quot;Seguir&quot;) para preencheres isto.</li>
              ) : (
                initial.followedSportPicks.map((p) => (
                  <li key={p.id}>
                    <PickCard pick={p} viewerCanViewPremium={canPremium} />
                  </li>
                ))
              )}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white">Análises dos teus desportos</h2>
            <p className="mt-1 text-xs text-zinc-500">Amostra editorial alinhada ao que segues.</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {initial.followedAnalisesSample.length === 0 ? (
                <li className="text-sm text-zinc-500 sm:col-span-2">Sem amostras — segue um desporto primeiro.</li>
              ) : (
                initial.followedAnalisesSample.map((a) => (
                  <li key={a.id}>
                    <AnaliseCardGrid analise={a} viewerCanViewPremium={canPremium} />
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "favoritos" ? (
        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="font-display text-lg font-bold text-white">Picks favoritas</h2>
            <ul className="mt-4 grid gap-4">
              {initial.favoritePicks.length === 0 ? (
                <li className="text-sm text-zinc-500">Usa o coração nas picks para guardares aqui.</li>
              ) : (
                initial.favoritePicks.map((p) => (
                  <li key={p.id}>
                    <PickCard pick={p} viewerCanViewPremium={canPremium} />
                  </li>
                ))
              )}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white">Análises favoritas</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {initial.favoriteAnalises.length === 0 ? (
                <li className="text-sm text-zinc-500 sm:col-span-2">Guarda análises a partir dos cards ou da página da análise.</li>
              ) : (
                initial.favoriteAnalises.map((a) => (
                  <li key={a.id}>
                    <AnaliseCardGrid analise={a} viewerCanViewPremium={canPremium} />
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "notifs" ? (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-white">Notificações</h2>
            <button
              type="button"
              disabled={pending}
              onClick={onMarkAll}
              className="text-xs font-bold uppercase tracking-wide text-gold-300 hover:underline disabled:opacity-50"
            >
              Marcar todas lidas
            </button>
          </div>
          <ul className="space-y-2">
            {notifs.length === 0 ? (
              <li className="text-sm text-zinc-500">Sem alertas — voltamos a gerar quando houver novidades.</li>
            ) : (
              notifs.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.read_at) onMarkRead(n);
                    }}
                    className={cn(
                      "flex w-full flex-col rounded-xl border px-4 py-3 text-left transition duration-300",
                      n.read_at ? "border-white/5 bg-black/20 opacity-70" : "border-gold-400/20 bg-gold-400/[0.06] hover:border-gold-400/40",
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90">{n.type}</span>
                    <span className="mt-1 font-semibold text-cream">{n.title}</span>
                    {n.body ? <span className="mt-1 text-sm text-zinc-400">{n.body}</span> : null}
                    {n.ref_type === "analise" && n.ref_id ? (
                      <Link href={`/analise/${encodeURIComponent(n.ref_id)}`} className="mt-2 text-xs font-bold text-gold-300 hover:underline">
                        Abrir →
                      </Link>
                    ) : null}
                    {n.ref_type === "pick" && n.ref_id ? (
                      <Link href={`/pick/${encodeURIComponent(n.ref_id)}`} className="mt-2 text-xs font-bold text-gold-300 hover:underline">
                        Abrir pick →
                      </Link>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
          <p className="mt-6 text-xs text-zinc-600">
            Push, e-mail e Telegram aparecem como canais futuros — já podes ativar as preferências abaixo para preparar a
            conta.
          </p>
        </section>
      ) : null}

      {tab === "historico" ? (
        <section>
          <h2 className="font-display text-lg font-bold text-white">Histórico de interações</h2>
          <ul className="mt-4 divide-y divide-white/5 rounded-xl border border-white/10">
            {historico.length === 0 ? (
              <li className="p-4 text-sm text-zinc-500">Ainda sem histórico.</li>
            ) : (
              historico.map((h, i) => (
                <li key={`${h.t}-${i}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="text-sm text-cream-muted">{h.label}</span>
                  <span className="text-[11px] text-zinc-600">{new Date(h.t).toLocaleString("pt-BR")}</span>
                  {h.href ? (
                    <Link href={h.href} className="text-xs font-bold text-gold-300 hover:underline">
                      Ver
                    </Link>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {tab === "prefs" && prefs ? (
        <section className="max-w-xl space-y-6">
          <h2 className="font-display text-lg font-bold text-white">Preferências de alerta</h2>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
            {(
              [
                ["notify_new_analise", "Nova análise nos desportos que segues"],
                ["notify_new_pick", "Nova pick nos desportos / competições que segues"],
                ["notify_pick_result", "Resultado (green/red) das picks favoritas"],
                ["notify_hot_streak", "Hot streak do portal"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gold-400/40 bg-black text-gold-500"
                  checked={Boolean(prefs[key])}
                  onChange={(e) =>
                    setPrefs((p) =>
                      p ? { ...p, [key]: e.target.checked } : p,
                    )
                  }
                />
                <span className="text-sm text-zinc-300">{label}</span>
              </label>
            ))}
          </div>
          <div className="space-y-4 rounded-2xl border border-dashed border-zinc-600/50 bg-zinc-950/40 p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Canais futuros</p>
            {(
              [
                ["channel_push", "Push (app / PWA)"],
                ["channel_email", "E-mail marketing / digest"],
                ["channel_telegram", "Telegram bot"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-start gap-3 opacity-80">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-zinc-600 bg-black"
                  checked={Boolean(prefs[key])}
                  onChange={(e) =>
                    setPrefs((p) =>
                      p ? { ...p, [key]: e.target.checked } : p,
                    )
                  }
                />
                <span className="text-sm text-zinc-400">{label}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={savePrefs}
            className="rounded-xl bg-gradient-to-r from-gold-300 to-gold-400 px-6 py-2.5 text-sm font-bold text-pitch-950 disabled:opacity-50"
          >
            Guardar preferências
          </button>
        </section>
      ) : null}
    </div>
  );
}
