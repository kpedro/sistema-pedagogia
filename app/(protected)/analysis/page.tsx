"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useState } from "react";

async function fetchMetrics() {
  const [occurrences, interventions] = await Promise.all([
    fetch("/api/occurrences").then((res) => res.json()),
    fetch("/api/interventions").then((res) => res.json())
  ]);
  return {
    occurrences: occurrences.occurrences ?? [],
    interventions: interventions.interventions ?? []
  };
}

async function runRiskRulesRequest() {
  const res = await fetch("/api/riskrules/run", { method: "POST" });
  if (!res.ok) {
    throw new Error("Falha ao executar risk rules");
  }
  return res.json();
}

export default function AnalysisPage() {
  const [message, setMessage] = useState<string | null>(null);
  const metrics = useQuery({
    queryKey: ["analysis-base"],
    queryFn: fetchMetrics
  });

  const mutation = useMutation({
    mutationFn: runRiskRulesRequest,
    onSuccess: (data) => {
      setMessage(
        `Regras avaliadas: ${data.result.rulesEvaluated} • Alertas abertos: ${data.result.alertsCreated} • Resolvidos: ${data.result.alertsResolved}`
      );
    },
    onError: () => setMessage("Falha ao executar motor de risco")
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Indicadores pedagógicos</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Ocorrências totais</p>
            <p className="text-2xl font-semibold text-slate-800">{metrics.data?.occurrences.length ?? 0}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Intervenções ativas</p>
            <p className="text-2xl font-semibold text-slate-800">
              {metrics.data?.interventions.filter((i: any) => i.status !== "COMPLETED").length ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Ocorrências graves</p>
            <p className="text-2xl font-semibold text-slate-800">
              {metrics.data?.occurrences.filter((o: any) => o.severity >= 4).length ?? 0}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-700">Motor de risco (RiskRules)</h2>
            <p className="text-sm text-slate-500">
              Analisa notas/frequência/importações recentes e gera alertas automáticos com intervenções vinculadas.
            </p>
          </div>
          <button
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
            onClick={() => mutation.mutate()}
          >
            Executar agora
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
        <p className="mt-4 text-xs text-slate-400">
          TODO Fase2: configurar agendas automáticas e painel visual com clusters de risco.
        </p>
      </Card>
    </div>
  );
}
