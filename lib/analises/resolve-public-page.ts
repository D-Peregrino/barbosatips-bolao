import type { AnaliseRow } from "@/lib/analises/types";
import { podePrevisualizarRascunhoEditorial } from "@/lib/analises/editorial-preview";
import {
  obterAnalisePorSlug,
  obterAnalisePublicadaPorSlug,
  statusPublicadoNormalizado,
} from "@/lib/analises/queries";
import { slugParaConsulta } from "@/lib/analises/slug-query";

export type AnalisePaginaPublica = {
  analise: AnaliseRow;
  /** true quando admin vê rascunho em `/analise/[slug]`. */
  previewRascunho: boolean;
};

/**
 * Resolve análise para `/analise/[slug]`: só publicadas no portal;
 * admins autenticados podem pré-visualizar rascunhos.
 */
export async function resolverAnalisePaginaPublica(
  slugParam: string,
): Promise<AnalisePaginaPublica | null> {
  const slug = slugParaConsulta(slugParam);
  if (!slug) return null;

  const adminPreview = await podePrevisualizarRascunhoEditorial();
  if (adminPreview) {
    const analise = await obterAnalisePorSlug(slug);
    if (!analise) return null;
    return {
      analise,
      previewRascunho: !statusPublicadoNormalizado(analise.status),
    };
  }

  const analise = await obterAnalisePublicadaPorSlug(slug);
  if (!analise) return null;
  return { analise, previewRascunho: false };
}
