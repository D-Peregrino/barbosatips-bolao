import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bolão Copa 2026 — Palpites | BarbosaTips",
  description: "Palpites fase de grupos — Bolão Copa do Mundo 2026 BarbosaTips.",
};

export default function BolaoPalpitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
