import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Oswald, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalLiveBar } from "@/components/live/GlobalLiveBar";
import { SiteWideJsonLd } from "@/components/seo/SiteWideJsonLd";
import { siteConfig } from "@/config/site";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { PwaClientMount } from "@/components/pwa/PwaClientMount";

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

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.shortTitle}`,
  },
  description: siteConfig.description,
  keywords: defaultKeywords,
  alternates: { canonical: base },
  appleWebApp: {
    capable: true,
    title: siteConfig.shortTitle,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
      <body className="bg-pitch-950 font-body text-cream-muted antialiased touch-manipulation [-webkit-tap-highlight-color:rgba(201,162,39,0.12)]">
        <SiteWideJsonLd />
        <Navbar />
        <GlobalLiveBar />

        <main className="pt-[calc(4.5rem+5.5rem)]">{children}</main>

        <Footer />
        <PwaClientMount />
      </body>
    </html>
  );
}
