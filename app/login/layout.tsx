import type { Metadata } from "next";

/** Login não deve aparecer como destino principal nos SERPs. */
export const metadata: Metadata = {
  title: "Entrar",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
