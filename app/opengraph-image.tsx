import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.shortTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #050403 0%, #12100c 42%, #1a1610 100%)",
          color: "#f5f0e6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            textShadow: "0 0 48px rgba(201,162,39,0.35)",
          }}
        >
          {siteConfig.shortTitle}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            fontWeight: 600,
            color: "#c9a227",
          }}
        >
          Análises e picks esportivas
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#a8a095",
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          Prognósticos, odds e leitura de mercado — futebol, NBA, NFL e mais.
        </div>
      </div>
    ),
    { ...size },
  );
}
