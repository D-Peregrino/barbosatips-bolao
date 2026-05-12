import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Palpites do Bolão | BarbosaTips",
  description: "Envie seus palpites dos jogos do bolão BarbosaTips.",
};

export default function BolaoPalpitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
