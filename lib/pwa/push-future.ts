/**
 * Estrutura futura para Web Push (sem implementação activa — sem chaves VAPID nem Supabase).
 * Quando integrar: gerar VAPID no servidor, guardar subscrições na BD, enviar a partir de worker/cron.
 */

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export type PushSubscriptionPayload = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
  /** Identificador do utilizador no teu backend (futuro). */
  userRef?: string;
};

export function pushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Placeholder: não solicita permissão nem regista subscrição. */
export async function registerPushWhenReady(): Promise<PushPermissionState> {
  if (!pushSupported()) return "unsupported";
  return Notification.permission as PushPermissionState;
}
