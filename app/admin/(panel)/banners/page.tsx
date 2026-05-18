import { ExternalLink, Megaphone, Trash2 } from "lucide-react";
import { BannerImageUpload } from "@/components/admin/banners/BannerImageUpload";
import { excluirBannerAction, salvarBannerAction } from "@/app/admin/(panel)/banners/actions";
import { listarBannersAdmin } from "@/lib/banners/queries";
import { BANNER_POSITION_LABELS, BANNER_POSITIONS, type BannerPosition } from "@/lib/banners/types";

const inputClass =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";
const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";

function PositionSelect({ defaultValue }: { defaultValue?: BannerPosition }) {
  return (
    <select name="posicao" defaultValue={defaultValue ?? "home_horizontal"} className={inputClass}>
      {BANNER_POSITIONS.map((posicao) => (
        <option key={posicao} value={posicao}>
          {BANNER_POSITION_LABELS[posicao]}
        </option>
      ))}
    </select>
  );
}

function percent(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2).replace(".", ",")}%`;
}

export default async function AdminBannersPage() {
  const banners = await listarBannersAdmin();
  const totalCliques = banners.reduce((acc, banner) => acc + banner.click_count, 0);
  const bannersAtivos = banners.filter((banner) => banner.ativo).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/95">
          Afiliados
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          Banners publicitários
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400">
          Cadastre criativos clicáveis para afiliados. Links externos abrem em nova aba com{" "}
          <code className="text-gold-200">rel=&quot;sponsored&quot;</code>.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold-400/15 bg-black/35 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
            Banners
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{banners.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/15 bg-black/35 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
            Ativos
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-200">{bannersAtivos}</p>
        </div>
        <div className="rounded-2xl border border-sky-400/15 bg-black/35 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
            Total de cliques
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-200">{totalCliques}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gold-400/15 bg-black/35 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <Megaphone className="h-5 w-5 text-gold-300" aria-hidden />
          <div>
            <h2 className="font-display text-lg font-bold text-white">Novo banner</h2>
            <p className="text-xs text-stone-500">Imagem, link de afiliado, posição e prioridade.</p>
          </div>
        </div>

        <form action={salvarBannerAction} className="grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="banner-new-title" className={labelClass}>
              Título
            </label>
            <input
              id="banner-new-title"
              name="titulo"
              required
              className={inputClass}
              placeholder="Nome do parceiro/campanha"
            />
          </div>

          <div>
            <label htmlFor="banner-new-link" className={labelClass}>
              Link afiliado
            </label>
            <input
              id="banner-new-link"
              name="link_destino"
              type="url"
              required
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={labelClass}>Posição</label>
            <PositionSelect />
          </div>

          <div>
            <label htmlFor="banner-new-priority" className={labelClass}>
              Prioridade
            </label>
            <input
              id="banner-new-priority"
              name="prioridade"
              type="number"
              defaultValue={0}
              className={inputClass}
            />
          </div>

          <div className="lg:col-span-2">
            <BannerImageUpload inputId="banner-new-image" />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
            <input name="ativo" type="checkbox" defaultChecked className="h-4 w-4 accent-[#C9A227]" />
            Ativo
          </label>

          <div className="flex justify-end lg:col-span-2">
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 text-sm font-bold text-[#0a0a0a] transition hover:brightness-110"
            >
              Salvar banner
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">Banners cadastrados</h2>

        {banners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold-400/20 bg-black/25 p-6 text-sm text-stone-500">
            Nenhum banner cadastrado ainda.
          </div>
        ) : (
          <div className="grid gap-4">
            {banners.map((banner) => {
              const ctrSimples = totalCliques > 0 ? (banner.click_count / totalCliques) * 100 : 0;
              return (
              <article
                key={banner.id}
                className="rounded-2xl border border-[#3d3420]/90 bg-black/35 p-4 sm:p-5"
              >
                <form action={salvarBannerAction} className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <input type="hidden" name="id" value={banner.id} />
                  <BannerImageUpload inputId={`banner-image-${banner.id}`} defaultValue={banner.imagem_url} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                          Cliques
                        </p>
                        <p className="mt-1 text-lg font-bold text-white">{banner.click_count}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                          CTR simples
                        </p>
                        <p className="mt-1 text-lg font-bold text-gold-200">
                          {percent(ctrSimples)}
                        </p>
                        <p className="mt-1 text-[10px] text-stone-600">
                          Participação no total de cliques registrados.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`banner-title-${banner.id}`} className={labelClass}>
                        Título
                      </label>
                      <input
                        id={`banner-title-${banner.id}`}
                        name="titulo"
                        required
                        defaultValue={banner.titulo}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor={`banner-link-${banner.id}`} className={labelClass}>
                        Link afiliado
                      </label>
                      <input
                        id={`banner-link-${banner.id}`}
                        name="link_destino"
                        type="url"
                        required
                        defaultValue={banner.link_destino}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Posição</label>
                      <PositionSelect defaultValue={banner.posicao} />
                    </div>

                    <div>
                      <label htmlFor={`banner-priority-${banner.id}`} className={labelClass}>
                        Prioridade
                      </label>
                      <input
                        id={`banner-priority-${banner.id}`}
                        name="prioridade"
                        type="number"
                        defaultValue={banner.prioridade}
                        className={inputClass}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                      <input
                        name="ativo"
                        type="checkbox"
                        defaultChecked={banner.ativo}
                        className="h-4 w-4 accent-[#C9A227]"
                      />
                      Ativo
                    </label>

                    <div className="flex flex-wrap justify-end gap-2">
                      <a
                        href={banner.link_destino}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-semibold text-stone-300 transition hover:border-gold-400/30 hover:text-gold-100"
                      >
                        Testar link
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                      <button
                        type="submit"
                        className="inline-flex min-h-[40px] items-center rounded-xl bg-gold-400 px-4 text-xs font-bold text-black transition hover:brightness-110"
                      >
                        Atualizar
                      </button>
                    </div>
                  </div>
                </form>

                <form action={excluirBannerAction} className="mt-3 flex justify-end">
                  <input type="hidden" name="id" value={banner.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Excluir banner
                  </button>
                </form>
              </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
