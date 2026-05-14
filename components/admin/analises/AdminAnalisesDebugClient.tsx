"use client";

import { useEffect, useState } from "react";

const EDITORIAL_COOKIE_NAME = "barbosatips_admin_analises";

/**
 * Dados visíveis só no browser (cookie httpOnly do admin editorial não aparece em document.cookie).
 */
export function AdminAnalisesDebugClient() {
  const [browser, setBrowser] = useState<string>("A ler dados do browser…");

  useEffect(() => {
    let lsKeys: string[] = [];
    try {
      lsKeys =
        typeof localStorage !== "undefined" ? Object.keys(localStorage) : [];
    } catch {
      lsKeys = ["(exceção ao aceder localStorage)"];
    }

    const docCookie =
      typeof document !== "undefined" ? document.cookie : "";

    const payload = {
      nota: `O cookie editorial ${EDITORIAL_COOKIE_NAME} é httpOnly — não aparece em document.cookie.`,
      document_cookie_comprimento: docCookie.length,
      document_cookie_amostra:
        docCookie.length > 0 ? docCookie.slice(0, 240) : "(vazio)",
      localStorage_chaves: lsKeys,
    };

    setBrowser(JSON.stringify(payload, null, 2));
  }, []);

  return (
    <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-zinc-700 bg-black/40 p-3 text-xs text-zinc-300 whitespace-pre-wrap break-all">
      {browser}
    </pre>
  );
}
