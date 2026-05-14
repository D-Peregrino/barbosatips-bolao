import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Oswald, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalLiveBar } from "@/components/live/GlobalLiveBar";
import { ProductionGtmNoScript, ProductionScripts } from "@/components/seo/ProductionScripts";
import { SiteWideJsonLd } from "@/components/seo/SiteWideJsonLd";
import { getPublicProductionConfig } from "@/config/production-public";
import { siteConfig } from "@/config/site";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { PwaClientMount } from "@/components/pwa/PwaClientMount";
import { LeadIntelligenceMount } from "@/components/leads/LeadIntelligenceMount";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { IsolatedClientMount } from "@/components/ops/IsolatedClientMount";
import { BetaLaunchRibbon } from "@/components/portal/BetaLaunchRibbon";
import {
  BRAND_APPLE_TOUCH_PNG,
  BRAND_FAVICON_ICO,
  BRAND_LOGO_512_WEBP,
} from "@/lib/brand/assets";

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
const prodPublic = getPublicProductionConfig();

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
  applicationName: siteConfig.shortTitle,
  description: siteConfig.description,
  keywords: defaultKeywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  alternates: { canonical: base },
  formatDetection: { telephone: false, address: false, email: false },
  ...(prodPublic.googleSiteVerification
    ? { verification: { google: prodPublic.googleSiteVerification } }
    : {}),
  appleWebApp: {
    capable: true,
    title: siteConfig.shortTitle,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: BRAND_FAVICON_ICO, sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: BRAND_LOGO_512_WEBP, sizes: "512x512", type: "image/webp" },
    ],
    apple: [{ url: BRAND_APPLE_TOUCH_PNG, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    url: base,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage.startsWith("/") ? siteConfig.ogImage : `/${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.shortTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage.startsWith("/") ? siteConfig.ogImage : `/${siteConfig.ogImage}`],
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
  /** Reduz tradução automática do Chrome que altera o DOM e causa hydration mismatch. */
  other: {
    google: "notranslate",
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
      translate="no"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-pitch-950 font-body text-cream-muted antialiased touch-manipulation [-webkit-tap-highlight-color:rgba(201,162,39,0.12)]"
        suppressHydrationWarning
      >
        <ProductionScripts />
        <ProductionGtmNoScript />
        <SiteWideJsonLd />
        <Navbar />
        <IsolatedClientMount scope="global_live_bar">
          <GlobalLiveBar />
        </IsolatedClientMount>

        <main className="pt-[calc(4.5rem+5.5rem)] pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] transition-[padding] duration-300 ease-out md:pb-0">
          <BetaLaunchRibbon />
          {children}
        </main>

        <div className="max-md:pb-[calc(3.25rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          <Footer />
        </div>
        <MobileBottomNav />
        <IsolatedClientMount scope="pwa_mount">
          <PwaClientMount />
        </IsolatedClientMount>
        <IsolatedClientMount scope="lead_intelligence_mount">
          <LeadIntelligenceMount />
        </IsolatedClientMount>
      </body>
    </html>
  );
}
