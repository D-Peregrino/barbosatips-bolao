"use client";

import { useEffect, useRef, useState } from "react";
import { uploadBannerImageAction } from "@/app/admin/(panel)/banners/actions";

type Props = {
  inputId: string;
  defaultValue?: string;
};

const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const inputClass =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";

export function BannerImageUpload({ inputId, defaultValue = "" }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [previewBlob, setPreviewBlob] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewBlob) URL.revokeObjectURL(previewBlob);
    };
  }, [previewBlob]);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    if (previewBlob) URL.revokeObjectURL(previewBlob);
    const blobUrl = URL.createObjectURL(file);
    setPreviewBlob(blobUrl);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadBannerImageAction(formData);

    setLoading(false);
    if (result.ok) {
      setUrl(result.url);
      URL.revokeObjectURL(blobUrl);
      setPreviewBlob(null);
    } else {
      setError(result.error);
      URL.revokeObjectURL(blobUrl);
      setPreviewBlob(null);
    }
  }

  const preview = previewBlob || url.trim();

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={handleFile}
      />

      <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-[#3d3420]/90 bg-[#080706]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview de criativo dinâmico
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
            Sem imagem
          </div>
        )}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-xs font-semibold text-[#E8D48B]">
            Enviando...
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-[#5c4d28]/90 px-4 py-2 text-xs font-semibold text-[#E8D48B] transition hover:border-[#C9A227]/50 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Upload imagem"}
        </button>
      </div>

      <div>
        <label htmlFor={inputId} className={labelClass}>
          URL da imagem
        </label>
        <input
          id={inputId}
          name="imagem_url"
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className={inputClass}
          placeholder="https://..."
          autoComplete="off"
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
