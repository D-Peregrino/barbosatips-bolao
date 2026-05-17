"use client";

import { useState } from "react";

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const input =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";

type Props = {
  defaultDestaquePrincipal?: boolean;
  defaultPrioridade?: number;
};

export function EditorialDestaqueFields({
  defaultDestaquePrincipal = false,
  defaultPrioridade = 0,
}: Props) {
  const [principal, setPrincipal] = useState(defaultDestaquePrincipal);

  return (
    <div className="sm:col-span-2 space-y-4 rounded-xl border border-[#C9A227]/20 bg-[#080706]/80 p-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C9A227]">
          Destaque na home
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Controla o hero principal. Maior prioridade aparece primeiro.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input type="hidden" name="destaque_principal" value="0" />
        <input
          type="checkbox"
          name="destaque_principal"
          value="1"
          checked={principal}
          onChange={(e) => setPrincipal(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#5c4d28] bg-[#050608] text-[#C9A227] focus:ring-[#C9A227]/50"
        />
        <span>
          <span className="block text-sm font-semibold text-[#E8D48B]">Destaque principal (hero)</span>
          <span className="mt-0.5 block text-xs text-zinc-500">
            Ocupa o hero no topo da home. Apenas um é escolhido (maior prioridade).
          </span>
        </span>
      </label>

      <div>
        <label htmlFor="prioridade" className={label}>
          Prioridade
        </label>
        <input
          id="prioridade"
          name="prioridade"
          type="number"
          min={0}
          max={9999}
          step={1}
          defaultValue={defaultPrioridade}
          className={`${input} max-w-[140px]`}
        />
        <p className="mt-1 text-xs text-zinc-600">0 = normal · 10+ = topo editorial</p>
      </div>
    </div>
  );
}
