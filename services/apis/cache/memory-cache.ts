/**
 * Cache in-memory com TTL (segundos). Adequado a Server Components e a chamadas
 * do mock no mesmo processo Node. Para cliente, o hook mantém cache leve em ref.
 */
type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

function now(): number {
  return Date.now();
}

export function sportsCacheKey(parts: (string | number | undefined | null)[]): string {
  return parts.map((p) => String(p ?? "")).join("::");
}

export function sportsCacheGet<T>(key: string): T | undefined {
  const e = store.get(key) as Entry<T> | undefined;
  if (!e) return undefined;
  if (e.expiresAt <= now()) {
    store.delete(key);
    return undefined;
  }
  return e.value;
}

export function sportsCacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  const ttlMs = Math.max(1, ttlSeconds) * 1000;
  store.set(key, { value, expiresAt: now() + ttlMs });
}

export function sportsCacheInvalidatePrefix(prefix: string): void {
  for (const k of Array.from(store.keys())) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}

export function sportsCacheClear(): void {
  store.clear();
}
