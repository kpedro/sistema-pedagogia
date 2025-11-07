"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchReferenceData } from "@/lib/client/reference";

const schema = z.object({
  studentId: z.string().min(1),
  classId: z.string().optional(),
  title: z.string().min(3),
  summary: z.string().optional(),
  plan: z.string().optional(),
  followUpAt: z.string().optional(),
  status: z.string().optional()
});

type FormData = z.infer<typeof schema>;

async function fetchInterventions() {
  const res = await fetch("/api/interventions");
  if (!res.ok) throw new Error("Erro ao listar intervenções");
  return res.json() as Promise<{
    interventions: Array<{
      id: string;
      title: string;
      status: string;
      student: { name: string };
      createdAt: string;
      followUpAt: string | null;
    }>;
  }>;
}

export default function InterventionsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data } = useQuery({ queryKey: ["interventions"], queryFn: fetchInterventions });
  const reference = useQuery({
    queryKey: ["reference"],
    queryFn: fetchReferenceData
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const students = reference.data?.students ?? [];
  const classes = reference.data?.classes ?? [];

  const onSubmit = async (values: FormData) => {
    setError(null);
    const response = await fetch("/api/interventions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        followUpAt: values.followUpAt ? new Date(values.followUpAt) : undefined
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Falha ao criar intervenção");
      return;
    }

    form.reset();
    await queryClient.invalidateQueries({ queryKey: ["interventions"] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Nova intervenção</h2>
        <p className="text-sm text-slate-500">Associe à ocorrência ou alerta conforme necessidade.</p>

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
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            Título
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("title")} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            Resumo
            <textarea className="mt-1 h-20 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("summary")} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-600">
            Plano de ação
            <textarea className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("plan")} />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Data follow-up
            <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("followUpAt")} />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Status
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("status")}>
              <option value="OPEN">Em aberto</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="COMPLETED">Concluída</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="md:col-span-2 flex justify-end">
            <button
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
              type="submit"
            >
              Registrar intervenção
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Intervenções</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Aluno</th>
                <th className="px-3 py-2 text-left">Título</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Criado</th>
                <th className="px-3 py-2 text-left">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {data?.interventions.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.student?.name ?? "—"}</td>
                  <td className="px-3 py-2">{item.title}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-3 py-2">
                    {item.followUpAt ? new Date(item.followUpAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
