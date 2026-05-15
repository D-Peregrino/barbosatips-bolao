# Patrocinadores — imagens locais

Coloca aqui os ficheiros com **estes nomes exactos** (podes usar `.png`, `.jpg` ou `.webp` — ajusta a extensão em `config/sponsor-banners.ts` se mudares o formato).

| Ficheiro (exemplo) | Zona no site |
|--------------------|----------------|
| `home-horizontal` | Faixa horizontal na home (tablet/desktop) |
| `sidebar-desktop` | Coluna esquerda em ecrãs grandes (`CommercialPageShell`) |
| `mobile-strip` | Faixa compacta em mobile (home, picks, análises) |
| `feed-between` | Entre picks e análises na home; entre secções em `/picks` e `/analises` |

1. Activa o slot em `config/sponsor-banners.ts` (`enabled: true`).
2. Coloca o ficheiro com o nome definido em `imageFile`.
3. Preenche `href` e `alt` apropriados.

Sem CDN nem CMS — só substituir ficheiros e, se precisares, editar `config/sponsor-banners.ts`.
