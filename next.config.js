const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth avatars
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Redirects para SEO
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/bolao/ranking",
        destination: "/ranking",
        permanent: true,
      },
      {
        source: "/estatisticas",
        destination: "/performance",
        permanent: true,
      },
      {
        source: "/estatisticas/:path*",
        destination: "/performance",
        permanent: true,
      },
      {
        source: "/politica-privacidade/:path*",
        destination: "/privacidade",
        permanent: true,
      },
      {
        source: "/politica-privacidade",
        destination: "/privacidade",
        permanent: true,
      },
      {
        source: "/bolao/criar",
        destination: "/bolao",
        permanent: true,
      },
    ];
  },

  // Headers de segurança e performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), push=(self)",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // Cache longo para assets estáticos
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/admin-editorial/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/admin-picks/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/admin-leads/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/admin/bolao/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/admin/analises/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/acesso-negado/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, private, max-age=0" },
        ],
      },
    ];
  },

  experimental: {
    instrumentationHook: true,
    // Otimização de pacotes para bundle menor
    optimizePackageImports: ["lucide-react", "date-fns", "@tanstack/react-query"],
    // Capas de análise até 5 MB (Supabase Storage)
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },

  compress: true,

  /**
   * Garante uma única cópia física de `@tanstack/react-query` no bundle.
   * Duas cópias quebram o React Context → "No QueryClient set, use QueryClientProvider".
   */
  webpack: (config) => {
    const rq = path.resolve(__dirname, "node_modules/@tanstack/react-query");
    const qc = path.resolve(__dirname, "node_modules/@tanstack/query-core");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tanstack/react-query": rq,
      "@tanstack/query-core": qc,
    };
    return config;
  },
};

module.exports = nextConfig;
