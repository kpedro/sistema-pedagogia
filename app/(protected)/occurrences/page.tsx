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
  isConfidential: z.boolean().optional(),
  documentLink: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.startsWith("http"), {
      message: "Informe uma URL iniciando com http(s) ou deixe em branco"
    })
});

type FormData = z.infer<typeof schema>;

async function fetchOccurrences() {
  const res = await fetch("/api/occurrences");
  if (!res.ok) throw new Error("Erro ao carregar ocorrÃªncias");
  return res.json() as Promise<{
    occurrences: Array<{
      id: string;
      category: string;
      subtype: string;
      severity: number;
      status: string;
      happenedAt: string;
      student: { name: string };
      createdBy: { name: string };
      documentLink?: string;
    }>;
  }>;
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
      happenedAt: new Date().toISOString().slice(0, 16),
      documentLink: ""
    }
  });

  const students = reference.data?.students ?? [];
  const classes = reference.data?.classes ?? [];

  const onSubmit = async (values: FormData) => {
    setError(null);
    const documentLink = values.documentLink?.trim();
    const response = await fetch("/api/occurrences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        documentLink: documentLink ? documentLink : undefined,
        happenedAt: new Date(values.happenedAt)
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Falha ao criar ocorrÃªncia");
      return;
    }

    form.reset({ happenedAt: new Date().toISOString().slice(0, 16), documentLink: "" });
    await queryClient.invalidateQueries({ queryKey: ["occurrences"] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-700">Registrar ocorrÃªncia</h2>
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
                  {student.name} â€¢ {student.registration}
                  {student.className ? ` (${student.className})` : ""}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              {reference.isLoading ? "Carregando alunos..." : `Total disponÃ­veis: ${students.length}`}
            </span>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Turma (opcional)
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("classId")}>
              <option value="">Selecione</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} â€¢ {cls.grade ?? ""} {cls.shift ? `(${cls.shift})` : ""}
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
              <option value="PEDAGOGICA">PedagÃ³gica</option>
              <option value="PATRIMONIO">PatrimÃ´nio</option>
              <option value="SAUDE_BEM_ESTAR">SaÃºde/Bem-estar</option>
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
            Data/hora ocorrÃªncia
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              {...form.register("happenedAt")}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            DescriÃ§Ã£o
            <textarea className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("description")} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            AÃ§Ãµes adotadas
            <textarea className="mt-1 h-20 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("actionsTaken")} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            Link para documento (Google Docs/Sheets)
            <input
              type="url"
              placeholder="https://docs.google.com/..."
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              {...form.register("documentLink")}
            />
            {form.formState.errors.documentLink && (
              <p className="text-xs text-red-500">{form.formState.errors.documentLink.message}</p>
            )}
          </label>          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" {...form.register("isConfidential")} />
            Marcar como sigiloso
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-700">OcorrÃªncias recentes</h2>
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
                  <th className="px-3 py-2 text-left">Documento</th>
                </tr>
              </thead>
              <tbody>
                {data?.occurrences.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{new Date(item.happenedAt).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2">{item.student?.name ?? "â€”"}</td>
                    <td className="px-3 py-2">{item.category}</td>
                    <td className="px-3 py-2">{item.severity}</td>
                    <td className="px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2">{item.createdBy?.name ?? "â€”"}</td>
                    <td className="px-3 py-2">
                      {item.documentLink ? (
                        <a
                          className="text-brand underline hover:text-blue-700"
                          href={item.documentLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir no Google
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
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







