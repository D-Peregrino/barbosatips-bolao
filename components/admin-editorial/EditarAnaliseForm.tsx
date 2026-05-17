"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { atualizarAnaliseEditorialAction } from "@/app/admin-editorial/actions";
import type { SalvarAnaliseEditorialResult } from "@/lib/admin-editorial/salvar-result";
import { siteConfig } from "@/config/site";
import { EditorialCapaUpload } from "@/components/admin-editorial/EditorialCapaUpload";
import { EditorialVisualEditor } from "@/components/admin-editorial/EditorialVisualEditor";
import { EditorialIaAnaliseAssistente } from "@/components/admin-editorial/EditorialIaAnaliseAssistente";
import { EditorialExcluirAnalise } from "@/components/admin-editorial/EditorialExcluirAnalise";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";
import type { IaAnaliseDraft } from "@/lib/admin-editorial/ai-analise/types";

const resultadoInicial: SalvarAnaliseEditorialResult = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition enabled:hover:brightness-110 disabled:opacity-50"
    >
      {pending ? "A gravar…" : "Salvar alterações"}
    </button>
  );
}

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const input =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";
const textarea =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";

type Props = { initial: AnaliseRow };

function oddInicialStr(o: AnaliseRow["odd"]): string {
  const n = oddParaNumero(o);
  return Number.isFinite(n) && n > 0 ? String(n) : "";
}

export function EditarAnaliseForm({ initial }: Props) {
  const [state, formAction] = useFormState(atualizarAnaliseEditorialAction, resultadoInicial);

  const [titulo, setTitulo] = useState(initial.titulo);
  const [slug, setSlug] = useState(initial.slug);
  const [esporte, setEsporte] = useState(initial.esporte || "futebol");
  const [campeonato, setCampeonato] = useState(initial.campeonato);
  const [categoria, setCategoria] = useState(initial.categoria);
  const [tags, setTags] = useState(initial.tags);
  const [timeCasa, setTimeCasa] = useState(initial.time_casa);
  const [timeFora, setTimeFora] = useState(initial.time_fora);
  const [odd, setOdd] = useState(oddInicialStr(initial.odd));
  const [confianca, setConfianca] = useState(String(initial.confianca));
  const [resumo, setResumo] = useState(initial.resumo);
  const [conteudo, setConteudo] = useState(initial.conteudo ?? "");

  const aplicarIa = useCallback((d: IaAnaliseDraft) => {
    setTitulo(d.titulo);
    setSlug(d.slug);
    setEsporte(d.esporte);
    setCampeonato(d.campeonato);
    setCategoria(d.categoria);
    setTags(d.tags);
    setTimeCasa(d.timeCasa);
    setTimeFora(d.timeFora);
    setOdd(d.oddReferencia);
    setConfianca(String(d.confianca));
    setResumo(d.resumo);
    setConteudo(d.conteudoMarkdown);
  }, []);

  const erro = state?.ok === false ? state.error : "";
  const slugAnterior = String(initial.slug ?? "").trim().toLowerCase();

  return (
    <>
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="slug_anterior" value={slugAnterior} />

      <div className="flex flex-col gap-3 rounded-xl border border-[#C9A227]/25 bg-[#080706]/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C9A227]">Produção</p>
          <p className="text-xs text-zinc-500">IA local — substitui campos atuais ao aplicar.</p>
        </div>
        <EditorialIaAnaliseAssistente onApply={aplicarIa} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="titulo" className={label}>
            Título
          </label>
          <input
            id="titulo"
            name="titulo"
            className={input}
            required
            autoComplete="off"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="slug" className={label}>
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            className={input}
            required
            autoComplete="off"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="esporte" className={label}>
            Esporte (hub público)
          </label>
          <select
            id="esporte"
            className={input}
            value={esporte}
            onChange={(e) => setEsporte(e.target.value)}
          >
            {siteConfig.sports.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="campeonato" className={label}>
            Campeonato
          </label>
          <input
            id="campeonato"
            className={input}
            autoComplete="off"
            value={campeonato}
            onChange={(e) => setCampeonato(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="categoria" className={label}>
            Categoria
          </label>
          <input
            id="categoria"
            className={input}
            placeholder="ex.: Futebol, NBA, Valor"
            autoComplete="off"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tags" className={label}>
            Tags
          </label>
          <input
            id="tags"
            className={input}
            placeholder="futebol, over, correct score, valor"
            autoComplete="off"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="time_casa" className={label}>
            Time casa
          </label>
          <input
            id="time_casa"
            className={input}
            autoComplete="off"
            value={timeCasa}
            onChange={(e) => setTimeCasa(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="time_fora" className={label}>
            Time fora
          </label>
          <input
            id="time_fora"
            className={input}
            autoComplete="off"
            value={timeFora}
            onChange={(e) => setTimeFora(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="odd" className={label}>
            Odd
          </label>
          <input
            id="odd"
            type="text"
            inputMode="decimal"
            className={input}
            placeholder="2.10"
            autoComplete="off"
            value={odd}
            onChange={(e) => setOdd(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confianca" className={label}>
            Confiança (0–100)
          </label>
          <input
            id="confianca"
            type="number"
            min={0}
            max={100}
            className={input}
            autoComplete="off"
            value={confianca}
            onChange={(e) => setConfianca(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="resumo" className={label}>
            Resumo
          </label>
          <textarea
            id="resumo"
            name="resumo"
            className={textarea}
            rows={3}
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
          />
        </div>
      </div>

      <EditorialVisualEditor
        key={initial.id}
        defaultValue={initial.conteudo}
        value={conteudo}
        onChange={setConteudo}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <EditorialCapaUpload key={initial.slug} defaultValue={initial.imagem_capa} />
        <div className="sm:col-span-2">
          <label htmlFor="status" className={label}>
            Estado
          </label>
          <select id="status" name="status" className={input} defaultValue={initial.status}>
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
      </div>

      {erro ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {erro}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <Link
          href={`/analise/${encodeURIComponent(initial.slug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-[#5c4d28]/90 px-6 py-2.5 text-sm font-medium text-[#E8D48B] transition hover:border-[#C9A227]/50"
        >
          Ver no portal
        </Link>
        <Link
          href="/admin-editorial"
          className="rounded-xl border border-[#5c4d28]/90 px-6 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          Cancelar
        </Link>
      </div>

    </form>

    <EditorialExcluirAnalise id={initial.id} slug={initial.slug} titulo={initial.titulo} />
    </>
  );
}
