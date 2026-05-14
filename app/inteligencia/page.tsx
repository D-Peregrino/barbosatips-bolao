import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildKeywordsFromParts } from "@/lib/seo/auto-seo";
import { InteligenciaDashboard } from "@/components/inteligencia/InteligenciaDashboard";

const base = siteConfig.url.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: `Inteligência esportiva · ${siteConfig.shortTitle}`,
  description:
    "Central de inteligência BarbosaTips: odds justas, EV+, probabilidades, correct score, heatmaps, xG, forma, comparativos e tendências para futebol, ténis e NBA.",
  keywords: buildKeywordsFromParts([
    "inteligência esportiva",
    "odds justas",
    "expected value",
    "xG",
    "NBA analytics",
    "ATP",
    siteConfig.name,
  ]),
  alternates: { canonical: `${base}/inteligencia` },
  openGraph: {
    title: `Inteligência esportiva · ${siteConfig.shortTitle}`,
    description:
      "Painel técnico com odds justas, EV+, probabilidades, heatmaps, xG e tendências — futebol, ténis e NBA.",
    url: `${base}/inteligencia`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
};

export default function InteligenciaPage() {
  return <InteligenciaDashboard />;
}
