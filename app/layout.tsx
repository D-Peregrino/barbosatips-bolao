import type { Metadata } from "next";
import "./globals.css";
import { Oswald, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SiteWideJsonLd } from "@/components/seo/SiteWideJsonLd";
import { siteConfig } from "@/config/site";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";

const fontDisplay = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const base = siteConfig.url.replace(/\/$/, "");

const defaultKeywords = buildKeywordsFromParts([
  siteConfig.name,
  "futebol",
  "NBA",
  "NFL",
  "prognóstico",
  "tips",
  "análise esportiva",
]);

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.shortTitle}`,
  },
  description: siteConfig.description,
  keywords: defaultKeywords,
  alternates: { canonical: base },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    url: base,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body className="bg-pitch-950 font-body text-cream-muted antialiased">
        <SiteWideJsonLd />
        <Navbar />

        <main className="pt-[72px]">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
