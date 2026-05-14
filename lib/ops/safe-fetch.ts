import { opsLogError } from "@/lib/ops/logger";
import { isAbortError } from "@/lib/ops/errors";

export type FetchWithRetryOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  /** Espaço entre tentativas (ms), base + jitter. */
  retryBaseDelayMs?: number;
  scope?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * `fetch` com timeout (AbortSignal) e retry leve em falhas de rede / 5xx.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const {
    timeoutMs = 15000,
    retries = 2,
    retryBaseDelayMs = 400,
    scope = "fetchWithRetry",
    ...init
  } = options;

  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(input, {
        ...init,
        signal: ctrl.signal,
      });
      clearTimeout(t);

      if (res.ok || res.status < 500) return res;

      lastErr = new Error(`HTTP ${res.status}`);
      if (attempt < retries) {
        const jitter = Math.floor(Math.random() * 200);
        await sleep(retryBaseDelayMs * (attempt + 1) + jitter);
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (isAbortError(e)) {
        opsLogError(scope, e, { attempt, url: String(input), kind: "timeout_or_abort" });
        throw e;
      }
      if (attempt < retries) {
        const jitter = Math.floor(Math.random() * 200);
        await sleep(retryBaseDelayMs * (attempt + 1) + jitter);
        continue;
      }
      opsLogError(scope, e, { attempt, url: String(input) });
      throw e;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/**
 * Correr promessa com timeout — não cancela trabalho interno; apenas deixa de esperar.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label = "timeout"): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`${label}: excedeu ${ms}ms`));
    }, ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}
