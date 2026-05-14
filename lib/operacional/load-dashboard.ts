import { listarTodasAnalisesAdmin } from "@/lib/analises/admin-queries";
import { listarAnalisesPublicadas } from "@/lib/analises/queries";
import { listLeadsForAdmin } from "@/lib/leads/actions";
import { listarQuickPicks } from "@/lib/picks/queries";
import {
  buildAgenda,
  buildEsportesEmAlta,
  buildLeadsResumo,
  buildProducao,
  buildResumoDia,
} from "@/lib/operacional/build-dashboard";

export async function loadOperacionalDashboard() {
  const ref = new Date();
  const [picks, todasAnalises, analisesPublicadas, leads] = await Promise.all([
    listarQuickPicks(false),
    listarTodasAnalisesAdmin(),
    listarAnalisesPublicadas(false),
    listLeadsForAdmin(),
  ]);

  return {
    refLabel: ref.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    resumo: buildResumoDia(picks, analisesPublicadas, ref),
    agenda: buildAgenda(picks, ref),
    producao: buildProducao(todasAnalises, picks, ref),
    leads: buildLeadsResumo(leads, ref),
    esportesEmAlta: buildEsportesEmAlta(picks, ref),
    picksRecentes: [...picks]
      .filter((p) => p.status === "ativo")
      .sort((a, b) => b.confianca - a.confianca)
      .slice(0, 5),
    leadsSampleCap: leads.length,
  };
}

export type OperacionalDashboardModel = Awaited<ReturnType<typeof loadOperacionalDashboard>>;
