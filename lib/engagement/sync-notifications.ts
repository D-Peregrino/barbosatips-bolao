import type { SupabaseClient } from "@supabase/supabase-js";
import { listarAnalisesPublicadas } from "@/lib/analises/queries";
import { buildHomePerformanceSnapshot } from "@/lib/home/home-performance";
import { listarQuickPicks } from "@/lib/picks/queries";
import { getLeaguesForSport, textoMatchesLiga } from "@/lib/sport-routes";

export type FollowRow = { kind: string; ref_key: string };

export type PrefsRow = {
  notify_new_analise: boolean;
  notify_new_pick: boolean;
  notify_pick_result: boolean;
  notify_hot_streak: boolean;
  last_sync_at: string | null;
};

async function insertNotif(
  supabase: SupabaseClient,
  row: {
    user_id: string;
    type: string;
    dedupe_key: string;
    title: string;
    body: string | null;
    ref_type: string | null;
    ref_id: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<boolean> {
  const { error } = await supabase.from("user_notifications").insert({
    ...row,
    metadata: row.metadata ?? {},
  });
  if (!error) return true;
  const code = (error as { code?: string }).code;
  if (code === "23505") return false;
  console.warn("user_notifications insert", error.message);
  return false;
}

function sinceMs(prefs: PrefsRow | null): number {
  if (prefs?.last_sync_at) {
    const t = new Date(prefs.last_sync_at).getTime();
    if (Number.isFinite(t)) return t;
  }
  return Date.now() - 36 * 3600000;
}

function pickMatchesCampeonatoFollow(
  esporte: string,
  campeonatoTexto: string,
  campFollows: FollowRow[],
): boolean {
  const leagues = getLeaguesForSport(esporte);
  for (const f of campFollows) {
    const parts = f.ref_key.split("/").map((p) => p.trim());
    if (parts.length !== 2) continue;
    const [esp, slug] = parts;
    if (esp !== esporte) continue;
    const league = leagues.find((l) => l.slug === slug);
    if (league && textoMatchesLiga(campeonatoTexto, slug, league.label)) return true;
  }
  return false;
}

/**
 * Gera notificações in-app com dedupe — prepara terreno para push/e-mail/Telegram (canais em prefs).
 */
export async function syncUserNotificationsForUser(
  supabase: SupabaseClient,
  userId: string,
  follows: FollowRow[],
  favPickIds: string[],
  prefs: PrefsRow | null,
): Promise<number> {
  const p = prefs ?? {
    notify_new_analise: true,
    notify_new_pick: true,
    notify_pick_result: true,
    notify_hot_streak: true,
    last_sync_at: null,
  };

  const since = sinceMs(p);
  const sportFollows = new Set(
    follows.filter((f) => f.kind === "esporte").map((f) => f.ref_key.trim().toLowerCase()),
  );
  const campFollows = follows.filter((f) => f.kind === "campeonato");
  const favSet = new Set(favPickIds.map((x) => x.trim().toLowerCase()));

  let inserted = 0;
  const cap = 24;

  const [analises, picks] = await Promise.all([
    listarAnalisesPublicadas(false),
    listarQuickPicks(false),
  ]);

  if (p.notify_new_analise && sportFollows.size > 0) {
    for (const a of analises) {
      if (inserted >= cap) break;
      const ts = new Date(a.created_at).getTime();
      if (ts < since) continue;
      if (!sportFollows.has(String(a.esporte ?? "").toLowerCase())) continue;
      const ok = await insertNotif(supabase, {
        user_id: userId,
        type: "new_analise",
        dedupe_key: `ana:${a.slug}`,
        title: "Nova análise",
        body: a.titulo,
        ref_type: "analise",
        ref_id: a.slug,
        metadata: { esporte: a.esporte },
      });
      if (ok) inserted += 1;
    }
  }

  if (p.notify_new_pick && (sportFollows.size > 0 || campFollows.length > 0)) {
    for (const pick of picks) {
      if (inserted >= cap) break;
      const ts = new Date(pick.created_at || pick.horario_jogo).getTime();
      if (ts < since) continue;
      const esp = pick.esporte.trim().toLowerCase();
      const bySport = sportFollows.has(esp);
      const byCamp = pickMatchesCampeonatoFollow(esp, pick.campeonato, campFollows);
      if (!bySport && !byCamp) continue;
      const ok = await insertNotif(supabase, {
        user_id: userId,
        type: "new_pick",
        dedupe_key: `picknew:${pick.id}`,
        title: "Nova pick rápida",
        body: `${pick.jogo} — ${pick.mercado}`,
        ref_type: "pick",
        ref_id: pick.id,
        metadata: { esporte: pick.esporte },
      });
      if (ok) inserted += 1;
    }
  }

  if (p.notify_pick_result && favSet.size > 0) {
    for (const pick of picks) {
      if (inserted >= cap) break;
      if (!favSet.has(pick.id.toLowerCase())) continue;
      if (pick.status !== "encerrado") continue;
      if (pick.resultado !== "green" && pick.resultado !== "red") continue;
      const ok = await insertNotif(supabase, {
        user_id: userId,
        type: "pick_result",
        dedupe_key: `pickres:${pick.id}:${pick.resultado}`,
        title: pick.resultado === "green" ? "Pick encerrada — GREEN" : "Pick encerrada — RED",
        body: pick.jogo,
        ref_type: "pick",
        ref_id: pick.id,
        metadata: { resultado: pick.resultado },
      });
      if (ok) inserted += 1;
    }
  }

  if (p.notify_hot_streak && sportFollows.size > 0) {
    const snap = buildHomePerformanceSnapshot(picks);
    if (snap.streakAtual >= 4) {
      const day = new Date().toISOString().slice(0, 10);
      const ok = await insertNotif(supabase, {
        user_id: userId,
        type: "hot_streak",
        dedupe_key: `streak:${day}`,
        title: "Hot streak",
        body: `Sequência atual: ${snap.streakAtual > 0 ? `${snap.streakAtual} greens` : `${Math.abs(snap.streakAtual)} reds`} nas picks públicas.`,
        ref_type: "performance",
        ref_id: "portal",
        metadata: { streak: snap.streakAtual },
      });
      if (ok) inserted += 1;
    }
  }

  await supabase.from("user_notification_preferences").upsert(
    {
      user_id: userId,
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return inserted;
}
