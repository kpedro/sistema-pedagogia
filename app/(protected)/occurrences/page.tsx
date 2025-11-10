"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { fetchReferenceData } from "@/lib/client/reference";

const schema = z.object({
  studentId: z.string().min(1, "Informe o estudante"),
  classId: z.string().optional(),
  category: z.string().min(2),
  subtype: z.string().min(2),
  severity: z.coerce.number().min(1).max(5),
  description: z.string().min(5),
  actionsTaken: z.string().optional(),
  happenedAt: z.string().min(1),
  isConfidential: z.boolean().optional()
});

type FormData = z.infer<typeof schema>;

type OccurrenceRow = {
  id: string;
  category: string;
  subtype: string;
  severity: number;
  status: string;
  happenedAt: string;
  student: { name: string } | null;
  createdBy: { name: string } | null;
  sheetUrl?: string;
};

const SHEET_FALLBACK_URL = process.env.NEXT_PUBLIC_OCCURRENCE_SHEET_URL ?? null;

async function fetchOccurrences() {
  const res = await fetch("/api/occurrences");
  if (!res.ok) throw new Error("Erro ao carregar ocorrências");
  return res.json() as Promise<{ occurrences: OccurrenceRow[] }>;
}

export default function OccurrencesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["occurrences"],
    queryFn: fetchOccurrences
  });
  const reference = useQuery({
    queryKey: ["reference"],
    queryFn: fetchReferenceData
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      happenedAt: new Date().toISOString().slice(0, 16)
    }
  });

  const students = reference.data?.students ?? [];
  const classes = reference.data?.classes ?? [];

  const onSubmit = async (values: FormData) => {
    setError(null);
    const response = await fetch("/api/occurrences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        happenedAt: new Date(values.happenedAt)
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Falha ao criar ocorrência");
      return;
    }

    form.reset({ happenedAt: new Date().toISOString().slice(0, 16) });
    await queryClient.invalidateQueries({ queryKey: ["occurrences"] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-700">Registrar ocorrência</h2>
            <p className="text-sm text-slate-500">
              Escolha o estudante/turma da lista (dados carregados automaticamente do cadastro base).
            </p>
          </div>
          <button
            data-new-record
            onClick={() => form.handleSubmit(onSubmit)()}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
          >
            Salvar
          </button>
        </div>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="text-sm font-medium text-slate-600">
            Estudante
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("studentId")}>
              <option value="">Selecione um estudante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} • {student.registration}
                  {student.className ? ` (${student.className})` : ""}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              {reference.isLoading ? "Carregando alunos..." : `Total disponíveis: ${students.length}`}
            </span>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Turma (opcional)
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("classId")}>
              <option value="">Selecione</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} • {cls.grade ?? ""} {cls.shift ? `(${cls.shift})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Categoria
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("category")}>
              <option value="INDISCIPLINA">Indisciplina</option>
              <option value="ATRASO_FALTA">Atraso/Falta</option>
              <option value="CONFLITO">Conflito</option>
              <option value="PEDAGOGICA">Pedagógica</option>
              <option value="PATRIMONIO">Patrimônio</option>
              <option value="SAUDE_BEM_ESTAR">Saúde/Bem-estar</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Subtipo
            <input
              placeholder="Ex.: Conflito verbal"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              {...form.register("subtype")}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Gravidade (1-5)
            <input
              type="number"
              min={1}
              max={5}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              {...form.register("severity", { valueAsNumber: true })}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Data/hora ocorrência
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              {...form.register("happenedAt")}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            Descrição
            <textarea className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("description")} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            Ações adotadas
            <textarea className="mt-1 h-20 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("actionsTaken")} />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" {...form.register("isConfidential")} />
            Marcar como sigiloso
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700">Ocorrências recentes</h2>
          {SHEET_FALLBACK_URL && (
            <a
              href={SHEET_FALLBACK_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
            >
              Abrir planilha geral
            </a>
          )}
        </div>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Carregando...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Aluno</th>
                  <th className="px-3 py-2 text-left">Categoria</th>
                  <th className="px-3 py-2 text-left">Gravidade</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Registro</th>
                  <th className="px-3 py-2 text-left">Planilha</th>
                </tr>
              </thead>
              <tbody>
                {data?.occurrences.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{new Date(item.happenedAt).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2">{item.student?.name ?? "-"}</td>
                    <td className="px-3 py-2">{item.category}</td>
                    <td className="px-3 py-2">{item.severity}</td>
                    <td className="px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2">{item.createdBy?.name ?? "-"}</td>
                    <td className="px-3 py-2">
                      {item.sheetUrl ? (
                        <a
                          className="text-brand underline hover:text-blue-700"
                          href={item.sheetUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir planilha
                        </a>
                      ) : SHEET_FALLBACK_URL ? (
                        <a className="text-xs text-brand" href={SHEET_FALLBACK_URL} target="_blank" rel="noreferrer">
                          Ver geral
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
