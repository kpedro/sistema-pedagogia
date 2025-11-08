"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { OficioTemplate } from "@/components/oficio-template";
import type { OficioTemplateProps } from "@/components/oficio-template";

const initialState = {
  numero: "85/2025",
  anoReferencia: "2025",
  assunto: "Solicitacao de Patrocinio - Bingao Cultural - Projeto Consciencia Negra 2025",
  destinatario: "Ilma. Sra. Naty Lavareda",
  cargoDestinatario: "Vereadora do Municipio de Boa Vista do Ramos - AM",
  localData: "Boa Vista do Ramos - AM, 29 de outubro de 2025",
  corpo: [
    "A EETI Professor Raimundo Benedito Costa, por meio da Comissao Organizadora do Projeto Consciencia Negra 2025, vem respeitosamente solicitar o apoio de Vossa Senhoria como uma colaboracao no valor de R$ 200,00 (duzentos reais) para a realizacao do tradicional Bingao Cultural que integra as festividades da Noite Cultural do projeto.",
    "O evento acontecera no dia 27 de novembro de 2025 com o objetivo de valorizar a cultura afro-brasileira, integrar a comunidade escolar e fomentar acoes de cidadania, inclusao e respeito as diferencas.",
    "A sua contribuicao sera essencial para o sucesso desta acao e para o fortalecimento do vinculo entre a escola e a comunidade. Colocamo-nos a disposicao para quaisquer esclarecimentos."
  ].join("\n\n"),
  anexos: "Cronograma oficial do evento\nPlano financeiro resumido",
  observacoes: "Documento gerado pelo modulo pedagogo",
  assinaturaNome: "Comissao Organizadora do Projeto Consciencia Negra - 2025",
  assinaturaCargo: "Coord. Geral Prof. Mario Pimentel",
  assinaturaRegistro: "",
  assinaturaImagem: ""
};

type FormState = typeof initialState;
type InputChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export default function OficioBuilder() {
  const [form, setForm] = useState<FormState>(initialState);

  const handleChange = (event: InputChangeEvent) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const anexosList = useMemo(
    () =>
      form.anexos
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    [form.anexos]
  );

  const templateData: OficioTemplateProps = {
    numero: form.numero,
    assunto: form.assunto,
    destinatario: form.destinatario,
    cargoDestinatario: form.cargoDestinatario,
    corpo: form.corpo,
    localData: form.localData,
    anexos: anexosList,
    observacoes: form.observacoes,
    assinatura: {
      nome: form.assinaturaNome,
      cargo: form.assinaturaCargo,
      registro: form.assinaturaRegistro,
      imageUrl: form.assinaturaImagem || undefined
    },
    anoReferencia: form.anoReferencia || undefined
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="print-hidden">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Oficio padronizado</h1>
            <p className="text-sm text-slate-500">
              Preencha os campos institucionais, personalize o conteudo e imprima em PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
              onClick={() => setForm(initialState)}
              type="button"
            >
              Restaurar exemplo
            </button>
            <button
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow"
              onClick={handlePrint}
              type="button"
            >
              Imprimir / PDF
            </button>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <label className="text-sm font-medium text-slate-600">
            Numero do oficio
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="numero"
              onChange={handleChange}
              value={form.numero}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Ano de referencia
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="anoReferencia"
              onChange={handleChange}
              value={form.anoReferencia}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Assunto
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="assunto"
              onChange={handleChange}
              value={form.assunto}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Destinatario
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="destinatario"
              onChange={handleChange}
              value={form.destinatario}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Cargo do destinatario
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="cargoDestinatario"
              onChange={handleChange}
              value={form.cargoDestinatario}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Local e data (ex.: Fortaleza, 07 de novembro de 2025)
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="localData"
              onChange={handleChange}
              value={form.localData}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 md:col-span-2">
            Corpo do texto
            <textarea
              className="mt-1 h-48 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="corpo"
              onChange={handleChange}
              value={form.corpo}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 md:col-span-2">
            Observacoes
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="observacoes"
              onChange={handleChange}
              value={form.observacoes}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 md:col-span-2">
            Anexos (um por linha)
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="anexos"
              onChange={handleChange}
              value={form.anexos}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Nome para assinaturas
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="assinaturaNome"
              onChange={handleChange}
              value={form.assinaturaNome}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Cargo da pessoa que assina
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="assinaturaCargo"
              onChange={handleChange}
              value={form.assinaturaCargo}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Registro / matricula (opcional)
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="assinaturaRegistro"
              onChange={handleChange}
              value={form.assinaturaRegistro}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            URL da imagem de assinatura (PNG/SVG)
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              name="assinaturaImagem"
              onChange={handleChange}
              placeholder="/assinaturas/diretora.png"
              value={form.assinaturaImagem}
            />
          </label>
        </form>
      </Card>

      <Card>
        <OficioTemplate {...templateData} />
        <p className="print-hidden pt-4 text-center text-xs text-slate-500">
          Utilize o botao &quot;Imprimir / PDF&quot; para salvar este oficio com margens A4.
        </p>
      </Card>
    </div>
  );
}
