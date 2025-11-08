"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchReferenceData } from "@/lib/client/reference";
import OficioBuilder from "@/components/oficio-builder";

const schema = z.object({
  templateId: z.string().optional(),
  title: z.string().min(3),
  type: z.string().min(2),
  content: z.string().min(10)
});

type FormData = z.infer<typeof schema>;

async function fetchDocuments() {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Erro ao carregar documentos");
  return res.json() as Promise<{
    documents: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      number: string | null;
      provisionalNumber: string | null;
      version: number;
      createdAt: string;
    }>;
  }>;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const documents = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const reference = useQuery({
    queryKey: ["reference"],
    queryFn: fetchReferenceData
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "OF",
      content: "<p>Conteúdo inicial do documento...</p>"
    }
  });

  const templates = reference.data?.templates ?? [];

  const onSubmit = async (values: FormData) => {
    setError(null);
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Falha ao criar documento");
      return;
    }

    form.reset({ type: "OF", content: "<p>Conteúdo inicial do documento...</p>" });
    await queryClient.invalidateQueries({ queryKey: ["documents"] });
  };

  const handleAction = async (id: string, action: "submit" | "approve" | "archive" | "reopen") => {
    const response = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="print-hidden">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-700">Novo documento</h2>
            <p className="text-sm text-slate-500">
              Numero e reservado automaticamente no rascunho. Ao aprovar, gera numeracao definitiva e PDF.
            </p>
          </div>
          <a className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" href="#oficio-builder">
            Gerar oficio padronizado
          </a>
        </div>
        <form className="mt-4 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="text-sm font-medium text-slate-600">
            Modelo (opcional)
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("templateId")}>
              <option value="">Sem modelo</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title} • {template.code ?? template.type}
                  {template.schoolId ? "" : " (global)"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Tipo
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("type")}>
              <option value="OF">Ofício</option>
              <option value="RO">Registro de Ocorrência</option>
              <option value="ATA">Ata</option>
              <option value="PLA">Plano</option>
              <option value="COM">Comunicado</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Título
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" {...form.register("title")} />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Conteúdo HTML
            <textarea
              className="mt-1 h-60 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
              {...form.register("content")}
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600" type="submit">
              Salvar rascunho
            </button>
          </div>
        </form>
      </Card>

      <section id="oficio-builder">
        <OficioBuilder />
      </section>

      <Card className="print-hidden">
        <h2 className="text-lg font-semibold text-slate-700">Documentos</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Número</th>
                <th className="px-3 py-2 text-left">Título</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Versão</th>
                <th className="px-3 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {documents.data?.documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-3 py-2">{doc.number ?? doc.provisionalNumber ?? "—"}</td>
                  <td className="px-3 py-2">{doc.title}</td>
                  <td className="px-3 py-2">{doc.type}</td>
                  <td className="px-3 py-2">{doc.status}</td>
                  <td className="px-3 py-2">{doc.version}</td>
                  <td className="px-3 py-2 flex flex-wrap gap-2">
                    {doc.status === "DRAFT" && (
                      <button className="rounded bg-amber-200 px-2 py-1 text-xs" onClick={() => handleAction(doc.id, "submit")}>
                        Enviar p/ revisão
                      </button>
                    )}
                    {doc.status === "REVIEW" && (
                      <button className="rounded bg-emerald-200 px-2 py-1 text-xs" onClick={() => handleAction(doc.id, "approve")}>
                        Aprovar
                      </button>
                    )}
                    {doc.status === "APPROVED" && (
                      <>
                        <a
                          className="rounded bg-slate-200 px-2 py-1 text-xs"
                          href={`/api/documents/${doc.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF
                        </a>
                        <a className="rounded bg-slate-200 px-2 py-1 text-xs" href={`/api/documents/${doc.id}/docx`}>
                          DOCX
                        </a>
                        <button className="rounded bg-rose-200 px-2 py-1 text-xs" onClick={() => handleAction(doc.id, "archive")}>
                          Arquivar
                        </button>
                      </>
                    )}
                    {doc.status === "ARCHIVED" && (
                      <button className="rounded bg-indigo-200 px-2 py-1 text-xs" onClick={() => handleAction(doc.id, "reopen")}>
                        Reabrir
                      </button>
                    )}
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

