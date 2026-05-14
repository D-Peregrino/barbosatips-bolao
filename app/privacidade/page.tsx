import type { Metadata } from "next";
import Link from "next/link";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/build-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Política de privacidade · ${siteConfig.shortTitle}`,
    description:
      "Como a BarbosaTips trata dados pessoais, cookies, bases legais, os teus direitos (LGPD) e contacto do encarregado.",
    path: "/privacidade",
  });
}

export default function PrivacidadePage() {
  const base = siteConfig.url.replace(/\/$/, "");
  return (
    <div className="commercial-page-bg pb-24 pt-8 text-zinc-100 sm:pt-10">
      <CommercialPageShell>
        <article className="commercial-card-elevated max-w-3xl border p-8 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400/90">
            LGPD · Transparência
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Política de privacidade
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Última atualização: {new Date().toLocaleDateString("pt-BR")} · Brasil
          </p>

          <div className="prose prose-invert prose-sm mt-8 max-w-none text-zinc-300 prose-headings:font-display prose-a:text-gold-300">
            <h2>1. Responsável pelo tratamento</h2>
            <p>
              {siteConfig.name} — site em {base}. Contacto:{" "}
              <a href={`mailto:${siteConfig.author.email}`}>{siteConfig.author.email}</a>.
            </p>

            <h2>2. Dados que podemos recolher</h2>
            <ul>
              <li>Dados de conta (ex.: e-mail, identificador de fornecedor OAuth) quando crias sessão.</li>
              <li>Dados técnicos (IP abreviado, user-agent, registos de erro) para segurança e desempenho.</li>
              <li>
                Dados de utilização agregados via ferramentas de analytics/medição (ex.: Google
                Analytics / Tag Manager), se ativadas, conforme políticas do fornecedor.
              </li>
            </ul>

            <h2>3. Finalidades e bases legais</h2>
            <ul>
              <li>Prestação do serviço e suporte — execução de medidas pré-contratuais/contratuais.</li>
              <li>Comunicações operacionais (ex.: recuperação de sessão) — legítimo interesse / execução.</li>
              <li>Medição de audiência e melhoria do produto — consentimento quando exigido (ex.: cookies não essenciais).</li>
              <li>Cumprimento de obrigações legais e defesa em processos — obrigação legal / legítimo interesse.</li>
            </ul>

            <h2>4. Cookies</h2>
            <p>
              Utilizamos cookies e armazenamento local necessários à sessão, preferências e PWA. Cookies
              de terceiros (publicidade ou analytics) só são aplicados quando integrados e permitidos
              pela tua configuração e pela legislação aplicável.
            </p>

            <h2>5. Partilhas</h2>
            <p>
              Podemos recorrer a fornecedores de infraestrutura (ex.: alojamento, base de dados,
              e-mail transacional) sob cláusulas de tratamento e minimização de dados. Não vendemos listas
              de contactos.
            </p>

            <h2>6. Conservação</h2>
            <p>
              Conservamos dados apenas pelo tempo necessário às finalidades acima e às obrigações legais,
              apagando ou anonimizando quando deixarem de ser relevantes.
            </p>

            <h2>7. Os teus direitos (LGPD)</h2>
            <p>
              Podes solicitar confirmação de tratamento, acesso, correção, anonimização, eliminação ou
              portabilidade, e revogar consentimentos quando aplicável. Contacta-nos pelo e-mail acima;
              responderemos no prazo legal.
            </p>

            <h2>8. Segurança</h2>
            <p>
              Aplicamos boas práticas técnicas e organizativas. Nenhum sistema é infalível; em caso de
              incidente relevante comunicaremos conforme a lei.
            </p>

            <h2>9. Menores</h2>
            <p>
              O serviço dirige-se a maiores de 18 anos. Não recolhemos intencionalmente dados de menores.
            </p>

            <h2>10. Alterações</h2>
            <p>
              Esta política pode ser atualizada; a versão vigente mantém-se nesta página com data de
              revisão.
            </p>
          </div>

          <p className="mt-10 text-sm text-zinc-500">
            <Link href="/termos" className="text-gold-300 hover:underline">
              Termos de uso
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
