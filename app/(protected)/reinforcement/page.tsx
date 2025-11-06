"use client";

import { Card } from "@/components/ui/card";

export default function ReinforcementPage() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Reforço Escolar</h2>
        <p className="text-sm text-slate-500">
          Planejamento inicial para grupos de reforço baseados em alertas de risco e ocorrências pedagógicas.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <label className="font-medium">
            Estudantes sugeridos
            <textarea
              className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Cole as matrículas dos estudantes priorizados (exportar da análise de risco)."
            />
          </label>
          <label className="font-medium">
            Cronograma
            <textarea
              className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Defina dias/horários de reforço e responsáveis."
            />
          </label>
          <label className="font-medium">
            Metas
            <textarea
              className="mt-1 h-20 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Ex.: elevar média de matemática para ≥6, aumentar frequência para ≥90%."
            />
          </label>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          TODO Fase2: vincular intervenções automaticamente, registrar presenças e indicadores de evolução.
        </p>
      </Card>
    </div>
  );
}
