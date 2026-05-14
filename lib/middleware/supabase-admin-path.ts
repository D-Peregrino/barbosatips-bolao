/**
 * Rotas que exigem Supabase Auth + `users.role === "admin"`.
 * Exclui `/admin/bolao` (cookie próprio) e `/admin/analises` (cookie editorial).
 */
export function isSupabaseAdminControlledPath(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname.startsWith("/admin/bolao")) return false;
    if (pathname.startsWith("/admin/analises")) return false;
    return true;
  }
  if (pathname === "/admin-editorial" || pathname.startsWith("/admin-editorial/")) {
    return true;
  }
  if (pathname === "/admin-picks" || pathname.startsWith("/admin-picks/")) {
    return true;
  }
  if (pathname === "/admin-leads" || pathname.startsWith("/admin-leads/")) {
    return true;
  }
  return false;
}

export function isAdminAnalisesPublicLoginPath(pathname: string): boolean {
  return (
    pathname === "/admin/analises/login" ||
    pathname.startsWith("/admin/analises/login/")
  );
}
