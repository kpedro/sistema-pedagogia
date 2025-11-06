"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type Occurrence = {
  id: string;
  severity: number;
  status: string;
  happenedAt: string;
  category: string;
};

type Intervention = {
  id: string;
  status: string;
  followUpAt: string | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao carregar ${url}`);
  }
  return res.json();
}

export default function DashboardPage() {
  const occurrencesQuery = useQuery({
    queryKey: ["dashboard-occurrences"],
    queryFn: () => fetchJson<{ occurrences: Occurrence[] }>("/api/occurrences")
  });

  const interventionsQuery = useQuery({
    queryKey: ["dashboard-interventions"],
    queryFn: () => fetchJson<{ interventions: Intervention[] }>("/api/interventions")
  });

  const metrics = useMemo(() => {
    const occurrences = occurrencesQuery.data?.occurrences ?? [];
    const interventions = interventionsQuery.data?.interventions ?? [];

    const severe = occurrences.filter((item) => item.severity >= 4).length;
    const openInterventions = interventions.filter((item) => item.status === "OPEN").length;
    const reviewDocs = 0; // TODO Fase2: buscar documentos em revisão

    const nextIntervention = interventions
      .filter((item) => item.followUpAt)
      .map((item) => new Date(item.followUpAt as string))
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return {
      occurrences: occurrences.length,
      severe,
      openInterventions,
      reviewDocs,
      nextFollowUp: nextIntervention ? nextIntervention.toLocaleDateString("pt-BR") : "Nenhum"
    };
  }, [occurrencesQuery.data, interventionsQuery.data]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <h2 className="text-sm font-semibold text-slate-500">Ocorrências (30 dias)</h2>
          <p className="mt-2 text-3xl font-bold text-slate-800">{metrics.occurrences}</p>
          <span className="text-xs text-slate-400">Revise em Ocorrências ›</span>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-500">Ocorrências graves</h2>
          <p className="mt-2 text-3xl font-bold text-rose-600">{metrics.severe}</p>
          <span className="text-xs text-slate-400">Severidade ≥ 4</span>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-500">Intervenções em aberto</h2>
          <p className="mt-2 text-3xl font-bold text-amber-600">{metrics.openInterventions}</p>
          <span className="text-xs text-slate-400">Priorize follow-up</span>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-500">Próximo acompanhamento</h2>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{metrics.nextFollowUp}</p>
          <span className="text-xs text-slate-400">Atualize em Intervenções ›</span>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-slate-700">Ações rápidas</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <Link className="text-brand hover:text-blue-700" href="/occurrences">
              Registrar nova ocorrência (atalho: n)
            </Link>
            <Link className="text-brand hover:text-blue-700" href="/documents">
              Criar documento oficial
            </Link>
            <Link className="text-brand hover:text-blue-700" href="/studio">
              Publicar nota técnica
            </Link>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-slate-700">Inspirações da semana</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Resumo de boas práticas — revisar na Curadoria (TODO Fase2: feed IA).</li>
            <li>Podcast recomendado: “Gestão pedagógica em escolas integrais”.</li>
            <li>Revisar indicadores de risco após importação de boletins.</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
