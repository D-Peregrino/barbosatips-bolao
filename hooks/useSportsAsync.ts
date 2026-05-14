"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseSportsAsyncResult<T> = {
  data: T | null;
  fallbackData: T | null;
  displayData: T | null;
  loading: boolean;
  error: Error | null;
  isFallback: boolean;
  refresh: () => Promise<void>;
};

/**
 * Estado assíncrono genérico para dados desportivos: loading, erro e fallback ao último sucesso.
 * Passe `fetcher` memoizado com `useCallback` para evitar pedidos em loop.
 */
export function useSportsAsync<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options?: { enabled?: boolean },
): UseSportsAsyncResult<T> {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fallbackRef = useRef<T | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const next = await fetcher();
      fallbackRef.current = next;
      setData(next);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, fetcher]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void load();
  }, [enabled, load, ...deps]);

  const fallbackData = fallbackRef.current;
  const displayData = error ? fallbackData : data;
  const isFallback = Boolean(error && fallbackData !== null);

  return {
    data,
    fallbackData,
    displayData,
    loading,
    error,
    isFallback,
    refresh: load,
  };
}
