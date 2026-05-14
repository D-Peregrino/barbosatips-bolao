import type { Metadata } from "next";
import Link from "next/link";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Termos de uso · ${siteConfig.shortTitle}`,
    description:
      "Condições gerais de utilização do site BarbosaTips, conteúdos informativos, propriedade intelectual e responsabilidades do utilizador.",
    path: "/termos",
  });
}

export default function TermosPage() {
  const base = siteConfig.url.replace(/\/$/, "");
  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <article className="commercial-card-elevated max-w-3xl border p-8 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400/90">
            Informação legal
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Termos de uso
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Última atualização:{" "}
            <span suppressHydrationWarning>{new Date().toLocaleDateString("pt-BR")}</span> · Brasil
          </p>

          <div className="prose prose-invert prose-sm mt-8 max-w-none text-zinc-300 prose-headings:font-display prose-a:text-gold-300">
            <h2>1. Objeto</h2>
            <p>
              O site {siteConfig.name} ({base}) disponibiliza conteúdos desportivos informativos
              (análises, picks, estatísticas e materiais de apoio). O acesso implica aceitação destes
              termos.
            </p>

            <h2>2. Natureza informativa</h2>
            <p>
              Os conteúdos não constituem aconselhamento financeiro, jurídico ou incentivo a apostar.
              Decisões de jogo são exclusivas do utilizador, que deve respeitar a legislação local e
              jogar com responsabilidade (18+).
            </p>

            <h2>3. Conta e conduta</h2>
            <p>
              Quando existir registo ou login, comprometes-te a fornecer dados verídicos e a não
              abusar do serviço (spam, scraping agressivo, tentativas de intrusão ou uso que
              comprometa a estabilidade da plataforma).
            </p>

            <h2>4. Propriedade intelectual</h2>
            <p>
              Marca, textos, gráficos e código são protegidos. É permitida citação breve com atribuição
              e link para a fonte; reprodução integral requer autorização prévia.
            </p>

            <h2>5. Limitação de responsabilidade</h2>
            <p>
              O {siteConfig.name} esforça-se por manter informações atualizadas, mas não garante
              exaustividade ou ausência de erros. Não nos responsabilizamos por perdas decorrentes
              de apostas ou de decisões baseadas nos conteúdos.
            </p>

            <h2>6. Alterações</h2>
            <p>
              Podemos atualizar estes termos; a versão vigente publica-se nesta página. O uso
              continuado após alterações constitui aceitação.
            </p>

            <h2>7. Contacto</h2>
            <p>
              Dúvidas:{" "}
              <a href={`mailto:${siteConfig.author.email}`} className="font-medium">
                {siteConfig.author.email}
              </a>
              .
            </p>
          </div>

          <p className="mt-10 text-sm text-zinc-500">
            <Link href="/privacidade" className="text-gold-300 hover:underline">
              Política de privacidade
            </Link>
            {" · "}
            <Link href="/" className="text-gold-300 hover:underline">
              Voltar ao início
            </Link>
          </p>
        </article>
      </CommercialPageShell>
    </div>
  );
}
