"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function ImportPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Array<{ line: number; message: string }>>([]);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    setErrors([]);

    const res = await fetch("/api/import", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setMessage(payload?.error ?? "Falha ao importar arquivo");
      return;
    }

    const payload = await res.json();
    setMessage(`Linhas processadas: ${payload.processed}. Erros: ${payload.errors.length}.`);
    setErrors(payload.errors);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Importar notas/frequência (CSV)</h2>
        <p className="text-sm text-slate-500">
          Arquivo CSV/Sheets em UTF-8 BOM com separador `;`. Colunas: matricula;aluno;turma;disciplina;media;frequencia;periodo;ocorrenciasGraves.
        </p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            handleSubmit(formData).catch(() => setMessage("Erro inesperado"));
          }}
        >
          <label className="block text-sm font-medium text-slate-600">
            Período
            <input
              name="period"
              defaultValue={`BIM-${new Date().getFullYear()}`}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Arquivo CSV
            <input name="file" type="file" accept=".csv" className="mt-1 w-full" required />
          </label>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600" type="submit">
            Importar
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </Card>

      {errors.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-700">Erros encontrados</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-rose-600">
            {errors.map((error, index) => (
              <li key={`${error.line}-${index}`}>
                Linha {error.line}: {error.message}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
