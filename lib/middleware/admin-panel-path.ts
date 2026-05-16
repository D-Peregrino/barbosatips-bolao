/**
 * Rotas que exigem sessão Supabase Auth + `users.role = 'admin'`.
 * Exclui `/admin/bolao` (sessão própria do bolão) e `/admin/login`.
 */
export function requiresAdminPanelSession(pathname: string): boolean {
  if (pathname.startsWith("/admin/bolao")) return false;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return false;
  }
  if (
    pathname === "/admin/analises/login" ||
    pathname.startsWith("/admin/analises/login/")
  ) {
    return false;
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
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
  if (pathname === "/operacional" || pathname.startsWith("/operacional/")) {
    return true;
  }
  return false;
}
