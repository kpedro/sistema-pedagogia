"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Card } from "@/components/ui/card";

const schema = z.object({
  code: z.string().min(2),
  type: z.string().min(2),
  title: z.string().min(3),
  html: z.string().min(10),
  changelog: z.string().optional()
});

type FormData = z.infer<typeof schema>;

async function fetchTemplates() {
  const res = await fetch("/api/templates");
  if (!res.ok) throw new Error("Erro ao carregar templates");
  return res.json() as Promise<{
    templates: Array<{
      id: string;
      code: string;
      type: string;
      title: string;
      version: number;
    }>;
  }>;
}

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const templates = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      html: "<p>Conteúdo do modelo...</p>"
    }
  });

  const onSubmit = async (values: FormData) => {
    setError(null);
    const response = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Falha ao salvar modelo");
      return;
    }
    form.reset({ html: "<p>Conteúdo do modelo...</p>" });
    await queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Adicionar modelo</h2>
        <p className="text-sm text-slate-500">
          Templates utilizam placeholders autorizados. Todo update gera nova versão automaticamente.
        </p>
        <form className="mt-4 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="text-sm font-medium text-slate-600">
            Código
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("code")} />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Tipo
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("type")} />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Título
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("title")} />
          </label>
          <label className="text-sm font-medium text-slate-600">
            HTML
            <textarea
              className="mt-1 h-60 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
              {...form.register("html")}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Changelog
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("changelog")} />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600" type="submit">
              Salvar modelo
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Modelos existentes</h2>
        <table className="mt-4 min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Título</th>
              <th className="px-3 py-2 text-left">Versão</th>
            </tr>
          </thead>
          <tbody>
            {templates.data?.templates.map((template) => (
              <tr key={template.id}>
                <td className="px-3 py-2">{template.code}</td>
                <td className="px-3 py-2">{template.type}</td>
                <td className="px-3 py-2">{template.title}</td>
                <td className="px-3 py-2">{template.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
