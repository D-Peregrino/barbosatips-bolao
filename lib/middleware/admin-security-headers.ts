import type { NextResponse } from "next/server";

/** Respostas de áreas administrativas: não indexar, não cachear em proxies partilhados. */
export function applyAdminSecurityHeaders<T extends NextResponse>(response: T): T {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store, private, max-age=0");
  return response;
}
