import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acesso restrito · BarbosaTips",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AcessoNegadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
