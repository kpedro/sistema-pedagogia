"use client";

import { useState } from "react";
import { marked } from "marked";
import { Card } from "@/components/ui/card";

export default function StudioPage() {
  const [markdown, setMarkdown] = useState<string>("# Nota técnica\n\nEscreva aqui em Markdown.");
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);

  const handleRender = () => {
    const rendered = marked.parse(markdown, { breaks: true });
    setHtmlPreview(rendered);
  };

  const handleSendEmail = async () => {
    setStatus("Distribuição simulada via SMTP (TODO Fase2: selecionar públicos).");
  };

  const handleUpload = async (type: "audio" | "video", file: File | null) => {
    if (!file) {
      setStatus("Selecione um arquivo antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("scope", "studio");
    formData.append("refId", "");
    formData.append("files", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      setStatus(`Falha ao enviar ${type}. Verifique limites (vídeo 200MB / 15min, áudio 80MB / 45min).`);
      return;
    }
    setStatus(`Upload de ${type} enviado para processamento (fila simulada).`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Estúdio de Conteúdo</h2>
        <p className="text-sm text-slate-500">
          Produção de notas técnicas, áudio e vídeo. TODO Fase2: fila real com workers e métricas detalhadas.
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-600">
              Markdown
              <textarea
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
                className="mt-1 h-60 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
              />
            </label>
            <div className="flex gap-2">
              <button
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
                onClick={handleRender}
              >
                Gerar preview
              </button>
              <button
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                onClick={handleSendEmail}
              >
                Enviar e-mail
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-600">Preview HTML</h3>
            <div
              className="mt-2 min-h-[240px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Uploads multimídia</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Áudio (mp3/webm)
            <input
              type="file"
              accept="audio/mpeg,audio/webm"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              onChange={(event) => handleUpload("audio", event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Vídeo (mp4)
            <input
              type="file"
              accept="video/mp4"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              onChange={(event) => handleUpload("video", event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Limites: vídeo 15min/200MB, áudio 45min/80MB. TODO Fase2: transcrição segura e distribuição com métricas.
        </p>
      </Card>

      {status && (
        <Card>
          <p className="text-sm text-slate-600">{status}</p>
        </Card>
      )}
    </div>
  );
}
