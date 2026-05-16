import { redirect } from "next/navigation";

export default function LoginRedirectPage({
  searchParams,
}: {
  searchParams: { next?: string; redirect?: string };
}) {
  const params = new URLSearchParams();
  const next = searchParams.next ?? searchParams.redirect;
  if (next) params.set("next", next);
  redirect(`/entrar${params.size ? `?${params.toString()}` : ""}`);
}
