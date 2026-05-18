import type { Metadata } from "next";
import { ClientLoginForm } from "@/components/auth/ClientLoginForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Entrar · ${siteConfig.shortTitle}`,
  description: "Entrada de cliente VIP BarbosaTips via magic link.",
};

export default function EntrarPage() {
  return <ClientLoginForm />;
}
