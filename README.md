# BarbosaTips 🏆

Portal esportivo profissional com análises, tips de apostas e bolão entre amigos.

## Stack

| Camada      | Tecnologia                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Estilos     | Tailwind CSS + Design System próprio|
| Banco       | Supabase (PostgreSQL + Auth)        |
| Deploy      | Vercel (Edge Functions + ISR)       |
| Linguagem   | TypeScript strict                   |

## Início Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### 3. Configurar banco de dados
```bash
# Instale a CLI do Supabase
npm install -g supabase

# Inicie o Supabase local
supabase start

# Rode a migration inicial
supabase db push

# Gere os tipos TypeScript
npm run db:types
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
barbosatips/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Navbar, Footer, AdSense)
│   ├── page.tsx            # Home (ISR 10min)
│   ├── tips/               # Tips de apostas
│   ├── analises/[slug]/    # Artigos SEO (SSG)
│   ├── bolao/              # Sistema de bolão
│   ├── dashboard/          # Área do usuário (SSR)
│   ├── ranking/            # Ranking tipsters
│   ├── admin/              # Painel admin
│   ├── api/                # Route Handlers
│   ├── sitemap.ts          # Sitemap dinâmico
│   └── robots.ts
│
├── components/
│   ├── layout/             # Navbar, Footer, Hero
│   ├── tips/               # TipCard, TipsFilter
│   ├── analises/           # AnaliseCard
│   ├── bolao/              # BolaoCard, Leaderboard
│   ├── ads/                # AdSlot (AdSense)
│   └── ui/                 # Componentes base
│
├── services/               # Queries ao Supabase
│   ├── tips.service.ts
│   ├── analises.service.ts
│   ├── bolao.service.ts
│   └── tipster.service.ts
│
├── lib/
│   ├── supabase/           # Clients (browser + server)
│   ├── seo.ts              # Metadata helpers + JSON-LD
│   └── utils.ts            # Utilitários gerais
│
├── hooks/                  # React hooks client
│   └── useAuth.ts
│
├── actions/                # Server Actions
│   └── createTip.ts
│
├── types/                  # TypeScript types
│   └── database.types.ts
│
├── config/
│   └── site.ts             # Configuração global do site
│
├── styles/
│   └── globals.css         # CSS global + design tokens
│
├── supabase/
│   └── migrations/         # SQL migrations versionadas
│       └── 001_initial_schema.sql
│
├── middleware.ts            # Auth guard (protected routes)
├── tailwind.config.js       # Design system completo
├── next.config.js           # Configuração Next.js
└── tsconfig.json
```

## Design System

### Cores principais
- `pitch-*` — Backgrounds (escuros)
- `gold` / `gold-*` — Cor de destaque da marca
- `win` — Verde para resultados positivos
- `loss` — Vermelho para resultados negativos

### Fontes
- **Oswald** — Títulos e headings (display)
- **DM Sans** — Corpo e UI
- **JetBrains Mono** — Odds e números

### Utilitários CSS
- `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`
- `.card`, `.card-hover`, `.card-gold`
- `.badge-win`, `.badge-loss`, `.badge-push`, `.badge-gold`, `.badge-vip`
- `.container-site`, `.section`, `.sidebar-layout`, `.tips-grid`
- `.odds-value`, `.skeleton`, `.text-gold-gradient`

## SEO

- `generateMetadata()` dinâmico por página
- SSG + ISR por página (revalidate configurável em `config/site.ts`)
- Schema.org `Article` e `Organization`
- Sitemap dinâmico (`/sitemap.xml`)
- Robots.txt configurado
- Open Graph + Twitter Cards
- Canonical URLs automáticos

## AdSense

Configure seu Publisher ID em `config/site.ts`:
```ts
adsense: {
  publisherId: "ca-pub-XXXXXXXXXXXXXXXX",
  slots: { ... }
}
```

O componente `<AdSlot>` exibe um placeholder visual em desenvolvimento.

## Deploy (Vercel)

1. Push para GitHub
2. Importe o repositório na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático 🚀

## Comandos úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run typecheck    # Verificar tipos TypeScript
npm run db:types     # Gerar tipos do Supabase
supabase db push     # Aplicar migrations
```
