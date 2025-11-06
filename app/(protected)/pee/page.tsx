"use client";

import { Card } from "@/components/ui/card";

export default function PeePage() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">PEE (Plano Estratégico Escolar)</h2>
        <p className="text-sm text-slate-500">
          MVP com estrutura mínima para registrar metas, indicadores e responsáveis. TODO Fase2: integrá-lo a planos de
          ação e cronogramas.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <label className="font-medium">
            Missão
            <textarea className="mt-1 h-20 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Missão da escola..." />
          </label>
          <label className="font-medium">
            Objetivos estratégicos
            <textarea className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Listar objetivos..." />
          </label>
          <label className="font-medium">
            Responsáveis
            <textarea className="mt-1 h-20 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Gestor(es) responsáveis..." />
          </label>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          TODO Fase2: persistência, fluxo de aprovação e metas vinculadas a intervenções e timetable.
        </p>
      </Card>
    </div>
  );
}
