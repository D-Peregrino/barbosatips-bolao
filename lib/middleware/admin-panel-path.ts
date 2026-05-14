/**
 * Rotas que exigem sessão do painel admin central (cookie `ADMIN_PANEL_COOKIE`).
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
  return false;
}

/** Raízes antigas → painel central (sub-rotas mantêm URL direta). */
export function shouldRedirectAdminRootToPanel(pathname: string): boolean {
  return (
    pathname === "/admin-editorial" ||
    pathname === "/admin-picks" ||
    pathname === "/admin-leads"
  );
}
