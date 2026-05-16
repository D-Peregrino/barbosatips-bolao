import type { Metadata } from "next";
import { ClientLoginForm } from "@/components/auth/ClientLoginForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Entrar · ${siteConfig.shortTitle}`,
  description: "Entre para acessar seus produtos BarbosaTips: VIP, Bolão ou Lojinha.",
};

export default function EntrarPage() {
  return <ClientLoginForm />;
}
