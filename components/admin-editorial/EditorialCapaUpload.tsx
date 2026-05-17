"use client";

import { useEffect, useRef, useState } from "react";
import { uploadAnaliseCapaEditorialAction } from "@/app/admin-editorial/upload-capa-action";

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const input =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";

type Props = {
  /** Valor inicial (edição) ou vazio (nova). */
  defaultValue?: string;
};

export function EditorialCapaUpload({ defaultValue = "" }: Props) {
  const [capa, setCapa] = useState(defaultValue);
  const [previewBlob, setPreviewBlob] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewBlob) URL.revokeObjectURL(previewBlob);
    };
  }, [previewBlob]);

  const srcPreview = previewBlob || (capa.trim() ? capa.trim() : null);

  async function onEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;

    setErro("");
    if (previewBlob) URL.revokeObjectURL(previewBlob);
    const blobUrl = URL.createObjectURL(f);
    setPreviewBlob(blobUrl);
    setAEnviar(true);

    const fd = new FormData();
    fd.append("file", f);
    const res = await uploadAnaliseCapaEditorialAction(fd);
    setAEnviar(false);

    if (res.ok) {
      setCapa(res.url);
      URL.revokeObjectURL(blobUrl);
      setPreviewBlob(null);
    } else {
      URL.revokeObjectURL(blobUrl);
      setPreviewBlob(null);
      setErro(res.error);
    }
  }

  return (
    <div className="sm:col-span-2">
      <p className={label}>Imagem de capa</p>
      <p className="mb-3 text-xs text-zinc-500">
        JPG, PNG ou WebP até 5 MB. A imagem é enviada para o Supabase Storage (bucket{" "}
        <code className="text-[#C9A227]/90">analises</code>) e a URL pública fica guardada
        no campo abaixo.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-[16/10] w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl border border-[#3d3420]/90 bg-[#080706]">
          {srcPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview dinâmico (blob ou URL externa)
            <img
              src={srcPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 px-4 text-center">
              <span className="text-2xl opacity-40" aria-hidden>
                🖼
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Sem pré-visualização
              </span>
            </div>
          )}
          {aEnviar ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-[#E8D48B]">
              A enviar…
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={onEscolherFicheiro}
          />
          <button
            type="button"
            disabled={aEnviar}
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-[#5c4d28]/90 px-4 py-2.5 text-sm font-semibold text-[#E8D48B] transition hover:border-[#C9A227]/50 disabled:opacity-50"
          >
            {aEnviar ? "A enviar…" : "Carregar ficheiro"}
          </button>

          <div>
            <label htmlFor="imagem_url" className={`${label} mb-1`}>
              URL da capa (preenchida automaticamente ou cole manualmente)
            </label>
            <input
              id="imagem_url"
              type="text"
              className={input}
              placeholder="https://… (opcional)"
              autoComplete="off"
              value={capa}
              onChange={(e) => setCapa(e.target.value)}
            />
          </div>

          {erro ? (
            <p className="text-sm text-red-300" role="alert">
              {erro}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
