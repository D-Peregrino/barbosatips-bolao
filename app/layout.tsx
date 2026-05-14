import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "BarbosaTips",
  description: "Portal esportivo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-pitch-950 text-white">
        <Navbar />

        <main className="pt-[72px]">
          {children}
        </main>
      </body>
    </html>
  );
}
