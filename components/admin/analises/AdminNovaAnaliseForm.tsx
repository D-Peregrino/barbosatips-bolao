"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { criarAnaliseAction } from "@/app/admin/analises/actions";
import { EditorialTiptapEditor } from "@/components/admin/analises/EditorialTiptapEditor";

const labels =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const input =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";
const textarea =
  "w-full min-h-[120px] rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";

export function AdminNovaAnaliseForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [campeonato, setCampeonato] = useState("");
  const [timeCasa, setTimeCasa] = useState("");
  const [timeFora, setTimeFora] = useState("");
  const [odd, setOdd] = useState("");
  const [confianca, setConfianca] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemCapa, setImagemCapa] = useState("");
  const [status, setStatus] = useState<"rascunho" | "publicado">("rascunho");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    startTransition(async () => {
      const res = await criarAnaliseAction({
        titulo,
        slug,
        campeonato,
        time_casa: timeCasa,
        time_fora: timeFora,
        odd,
        confianca,
        resumo,
        conteudo,
        imagem_capa: imagemCapa,
        status,
      });
      if (!res.ok) {
        setErro(res.error);
        return;
      }
      router.push("/admin/analises");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="titulo" className={labels}>
            Título
          </label>
          <input
            id="titulo"
            className={input}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            disabled={pending}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="slug" className={labels}>
            Slug (URL)
          </label>
          <input
            id="slug"
            className={input}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ex.: flamengo-x-palmeiras-brasileirao"
            required
            disabled={pending}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="campeonato" className={labels}>
            Campeonato
          </label>
          <input
            id="campeonato"
            className={input}
            value={campeonato}
            onChange={(e) => setCampeonato(e.target.value)}
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor="time_casa" className={labels}>
            Time casa
          </label>
          <input
            id="time_casa"
            className={input}
            value={timeCasa}
            onChange={(e) => setTimeCasa(e.target.value)}
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor="time_fora" className={labels}>
            Time fora
          </label>
          <input
            id="time_fora"
            className={input}
            value={timeFora}
            onChange={(e) => setTimeFora(e.target.value)}
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor="odd" className={labels}>
            Odd
          </label>
          <input
            id="odd"
            type="text"
            inputMode="decimal"
            className={input}
            value={odd}
            onChange={(e) => setOdd(e.target.value)}
            placeholder="2.10"
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor="confianca" className={labels}>
            Confiança (0–100)
          </label>
          <input
            id="confianca"
            type="number"
            min={0}
            max={100}
            className={input}
            value={confianca}
            onChange={(e) => setConfianca(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="resumo" className={labels}>
            Resumo curto
          </label>
          <textarea
            id="resumo"
            className={textarea}
            rows={3}
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="sm:col-span-2">
          <EditorialTiptapEditor
            value={conteudo}
            onChange={setConteudo}
            disabled={pending}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="imagem_capa" className={labels}>
            URL da imagem de capa
          </label>
          <input
            id="imagem_capa"
            type="url"
            className={input}
            value={imagemCapa}
            onChange={(e) => setImagemCapa(e.target.value)}
            placeholder="https://..."
            disabled={pending}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="status" className={labels}>
            Status
          </label>
          <select
            id="status"
            className={input}
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value === "publicado" ? "publicado" : "rascunho",
              )
            }
            disabled={pending}
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
      </div>

      {erro ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {erro}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition enabled:hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar análise"}
        </button>
        <Link
          href="/admin/analises"
          className="rounded-xl border border-[#5c4d28]/90 px-6 py-2.5 text-sm font-medium text-[#E8D48B] transition hover:border-[#C9A227]/50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
