"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { OficioTemplate, type OficioTemplateProps } from "@/components/oficio-template";
import { AtaTemplate, ComunicadoTemplate, RegistroTemplate } from "@/components/document-templates";

type InputChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type PreviewKind = "OFICIO" | "ATA" | "COMUNICADO" | "REGISTRO";

const previewOptions: Array<{ id: PreviewKind; label: string }> = [
  { id: "OFICIO", label: "Oficio" },
  { id: "ATA", label: "Ata" },
  { id: "COMUNICADO", label: "Comunicado" },
  { id: "REGISTRO", label: "Registro de ocorrencia" }
];

const initialOficioState = {
  numero: "85/2025",
  anoReferencia: "2025",
  assunto: "Solicitacao de Patrocinio - Bingao Cultural - Projeto Consciencia Negra 2025",
  destinatario: "Ilma. Sra. Naty Lavareda",
  cargoDestinatario: "Vereadora do Municipio de Boa Vista do Ramos - AM",
  localData: "Boa Vista do Ramos - AM, 29 de outubro de 2025",
  corpo: [
    "A escola vem respeitosamente solicitar o apoio de Vossa Senhoria como uma colaboracao no valor de R$ 200,00 para a realizacao do tradicional Bingao Cultural.",
    "O evento acontecera no dia 27 de novembro de 2025 e tem o objetivo de valorizar a cultura afro-brasileira e integrar a comunidade escolar."
  ].join("\n\n"),
  anexos: "Cronograma oficial do evento\nPlano financeiro resumido",
  observacoes: "Documento gerado pelo modulo pedagogo",
  assinaturaNome: "Comissao Organizadora",
  assinaturaCargo: "Coordenacao Geral",
  assinaturaRegistro: "",
  assinaturaImagem: ""
};

const initialAtaState = {
  titulo: "Ata da reuniao extraordinaria do conselho escolar",
  data: "29 de outubro de 2025",
  horaInicio: "15h00",
  horaFim: "17h15",
  local: "Sala de reunioes da EETI RBC",
  presentes: ["Diretora Maria Helena", "Coord. Pedagogico Joao Silva", "Representantes de turma"],
  pautas: ["Apresentacao dos resultados do 3º bimestre", "Planejamento do Projeto Consciencia Negra"],
  deliberacoes: ["Aprovado o cronograma do projeto", "Definida a comissao de captacao"],
  observacoes: "Proxima reuniao em 12/11.",
  responsavel: "Secretaria Escolar"
};

const initialComunicadoState = {
  titulo: "Comunicado aos responsaveis",
  destinatario: "Pais e responsaveis da turma 2º ano B",
  mensagem: [
    "Informamos que no dia 22/11/2025 realizaremos a Mostra Pedagogica de Projetos Inovadores.",
    "Solicitamos a presenca de todos para acompanhar as apresentacoes dos estudantes."
  ].join("\n\n"),
  emissor: "Direcao da EETI RBC",
  data: "Boa Vista do Ramos, 05 de novembro de 2025",
  contato: "(92) 3333-0000 • secretaria@seduc.am.gov.br"
};

const initialRegistroState = {
  numero: "RO-2025-118",
  data: "04/11/2025 - 10h35",
  local: "Quadra poliesportiva",
  envolvidos: ["Aluno: Pedro Araujo (1º ano A)", "Aluno: Lucas Mendes (1º ano A)"],
  descricao:
    "Durante o intervalo foi registrada uma discussao entre os estudantes citados, com troca de empurroes e palavras de baixo calao. A equipe de plantao interveio imediatamente.",
  medidas: [
    "Estudantes encaminhados a orientacao.",
    "Agendamento de conversa com os responsaveis.",
    "Registro encaminhado a coordenacao pedagogica."
  ].join("\n"),
  responsavel: "Prof. Carla Menezes"
};

const toList = (value: string | string[]) =>
  Array.isArray(value)
    ? value.map((item) => item.trim()).filter(Boolean)
    : value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);

export default function DocumentPrintStudio() {
  const [mode, setMode] = useState<PreviewKind>("OFICIO");
  const [oficioForm, setOficioForm] = useState(initialOficioState);
  const [ataForm, setAtaForm] = useState(initialAtaState);
  const [comunicadoForm, setComunicadoForm] = useState(initialComunicadoState);
  const [registroForm, setRegistroForm] = useState(initialRegistroState);

  const handleOficioChange = (event: InputChangeEvent) => {
    const { name, value } = event.target;
    setOficioForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAtaChange = (event: InputChangeEvent) => {
    const { name, value } = event.target;
    if (name === "presentes") {
      setAtaForm((prev) => ({ ...prev, presentes: value.split(/\r?\n/) }));
      return;
    }
    if (name === "pautas") {
      setAtaForm((prev) => ({ ...prev, pautas: value.split(/\r?\n/) }));
      return;
    }
    if (name === "deliberacoes") {
      setAtaForm((prev) => ({ ...prev, deliberacoes: value.split(/\r?\n/) }));
      return;
    }
    setAtaForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleComunicadoChange = (event: InputChangeEvent) => {
    const { name, value } = event.target;
    setComunicadoForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleRegistroChange = (event: InputChangeEvent) => {
    const { name, value } = event.target;
    if (name === "envolvidos") {
      setRegistroForm((prev) => ({ ...prev, envolvidos: value.split(/\r?\n/) }));
      return;
    }
    if (name === "medidas") {
      setRegistroForm((prev) => ({ ...prev, medidas: value }));
      return;
    }
    setRegistroForm((prev) => ({ ...prev, [name]: value }));
  };

  const anexosList = useMemo(() => toList(oficioForm.anexos), [oficioForm.anexos]);
  const medidasList = useMemo(() => toList(registroForm.medidas), [registroForm.medidas]);

  const oficioTemplateData: OficioTemplateProps = {
    numero: oficioForm.numero,
    assunto: oficioForm.assunto,
    destinatario: oficioForm.destinatario,
    cargoDestinatario: oficioForm.cargoDestinatario,
    corpo: oficioForm.corpo,
    localData: oficioForm.localData,
    anexos: anexosList,
    observacoes: oficioForm.observacoes,
    assinatura: {
      nome: oficioForm.assinaturaNome,
      cargo: oficioForm.assinaturaCargo,
      registro: oficioForm.assinaturaRegistro,
      imageUrl: oficioForm.assinaturaImagem || undefined
    },
    anoReferencia: oficioForm.anoReferencia || undefined
  };

  const resetActive = () => {
    if (mode === "OFICIO") setOficioForm(initialOficioState);
    if (mode === "ATA") setAtaForm(initialAtaState);
    if (mode === "COMUNICADO") setComunicadoForm(initialComunicadoState);
    if (mode === "REGISTRO") setRegistroForm(initialRegistroState);
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  const renderForm = () => {
    switch (mode) {
      case "OFICIO":
        return (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <label className="text-sm font-medium text-slate-600">
              Numero do documento
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="numero" onChange={handleOficioChange} value={oficioForm.numero} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Ano de referencia
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="anoReferencia" onChange={handleOficioChange} value={oficioForm.anoReferencia} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Assunto
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="assunto" onChange={handleOficioChange} value={oficioForm.assunto} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Destinatario
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="destinatario" onChange={handleOficioChange} value={oficioForm.destinatario} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Cargo do destinatario
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="cargoDestinatario" onChange={handleOficioChange} value={oficioForm.cargoDestinatario} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Local e data
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="localData" onChange={handleOficioChange} value={oficioForm.localData} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Corpo do texto
              <textarea className="mt-1 h-40 w-full rounded-xl border border-slate-300 px-3 py-2" name="corpo" onChange={handleOficioChange} value={oficioForm.corpo} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Observacoes
              <textarea className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="observacoes" onChange={handleOficioChange} value={oficioForm.observacoes} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Anexos (um por linha)
              <textarea className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="anexos" onChange={handleOficioChange} value={oficioForm.anexos} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Nome para assinatura
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="assinaturaNome" onChange={handleOficioChange} value={oficioForm.assinaturaNome} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Cargo
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="assinaturaCargo" onChange={handleOficioChange} value={oficioForm.assinaturaCargo} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Registro (opcional)
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="assinaturaRegistro" onChange={handleOficioChange} value={oficioForm.assinaturaRegistro} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              URL da imagem da assinatura
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                name="assinaturaImagem"
                onChange={handleOficioChange}
                placeholder="/assinaturas/diretora.png"
                value={oficioForm.assinaturaImagem}
              />
            </label>
          </form>
        );
      case "ATA":
        return (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <label className="text-sm font-medium text-slate-600">
              Titulo da ata
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="titulo" onChange={handleAtaChange} value={ataForm.titulo} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Data
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="data" onChange={handleAtaChange} value={ataForm.data} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Inicio
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="horaInicio" onChange={handleAtaChange} value={ataForm.horaInicio} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Encerramento
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="horaFim" onChange={handleAtaChange} value={ataForm.horaFim} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Local
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="local" onChange={handleAtaChange} value={ataForm.local} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Presentes (um por linha)
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                name="presentes"
                onChange={handleAtaChange}
                value={ataForm.presentes.join("\n")}
              />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Pautas (um por linha)
              <textarea className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="pautas" onChange={handleAtaChange} value={ataForm.pautas.join("\n")} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Deliberacoes (um por linha)
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                name="deliberacoes"
                onChange={handleAtaChange}
                value={ataForm.deliberacoes.join("\n")}
              />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Observacoes
              <textarea className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="observacoes" onChange={handleAtaChange} value={ataForm.observacoes} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Responsavel pela ata
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="responsavel" onChange={handleAtaChange} value={ataForm.responsavel} />
            </label>
          </form>
        );
      case "COMUNICADO":
        return (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Titulo
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="titulo" onChange={handleComunicadoChange} value={comunicadoForm.titulo} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Destinatarios
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                name="destinatario"
                onChange={handleComunicadoChange}
                value={comunicadoForm.destinatario}
              />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Mensagem
              <textarea className="mt-1 h-40 w-full rounded-xl border border-slate-300 px-3 py-2" name="mensagem" onChange={handleComunicadoChange} value={comunicadoForm.mensagem} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Emissor
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="emissor" onChange={handleComunicadoChange} value={comunicadoForm.emissor} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Data/Local
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="data" onChange={handleComunicadoChange} value={comunicadoForm.data} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Contato/Assinatura
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="contato" onChange={handleComunicadoChange} value={comunicadoForm.contato} />
            </label>
          </form>
        );
      case "REGISTRO":
        return (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <label className="text-sm font-medium text-slate-600">
              Numero
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="numero" onChange={handleRegistroChange} value={registroForm.numero} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Data e horario
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="data" onChange={handleRegistroChange} value={registroForm.data} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Local
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="local" onChange={handleRegistroChange} value={registroForm.local} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Envolvidos (um por linha)
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                name="envolvidos"
                onChange={handleRegistroChange}
                value={registroForm.envolvidos.join("\n")}
              />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Descricao do fato
              <textarea className="mt-1 h-40 w-full rounded-xl border border-slate-300 px-3 py-2" name="descricao" onChange={handleRegistroChange} value={registroForm.descricao} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Medidas adotadas (uma por linha)
              <textarea className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="medidas" onChange={handleRegistroChange} value={registroForm.medidas} />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Responsavel pelo registro
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" name="responsavel" onChange={handleRegistroChange} value={registroForm.responsavel} />
            </label>
          </form>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    switch (mode) {
      case "OFICIO":
        return <OficioTemplate {...oficioTemplateData} />;
      case "ATA":
        return (
          <AtaTemplate
            data={ataForm.data}
            deliberacoes={toList(ataForm.deliberacoes)}
            horaFim={ataForm.horaFim}
            horaInicio={ataForm.horaInicio}
            local={ataForm.local}
            observacoes={ataForm.observacoes}
            pautas={toList(ataForm.pautas)}
            presentes={toList(ataForm.presentes)}
            responsavel={ataForm.responsavel}
            titulo={ataForm.titulo}
          />
        );
      case "COMUNICADO":
        return (
          <ComunicadoTemplate
            contato={comunicadoForm.contato}
            data={comunicadoForm.data}
            destinatario={comunicadoForm.destinatario}
            emissor={comunicadoForm.emissor}
            mensagem={comunicadoForm.mensagem}
            titulo={comunicadoForm.titulo}
          />
        );
      case "REGISTRO":
        return (
          <RegistroTemplate
            data={registroForm.data}
            descricao={registroForm.descricao}
            envolvidos={toList(registroForm.envolvidos)}
            local={registroForm.local}
            medidas={medidasList}
            numero={registroForm.numero}
            responsavel={registroForm.responsavel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="oficio-builder">
      <Card className="print-hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Central de impressao</h1>
            <p className="text-sm text-slate-500">Escolha o modelo institucional e personalize antes de gerar o PDF ou enviar para impressao.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600" onClick={resetActive} type="button">
              Restaurar modelo
            </button>
            <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow" onClick={handlePrint} type="button">
              Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {previewOptions.map((option) => (
            <button
              key={option.id}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                mode === option.id ? "bg-brand text-white shadow" : "border border-slate-300 text-slate-700"
              }`}
              onClick={() => setMode(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6">{renderForm()}</div>
      </Card>

      <Card>
        {renderPreview()}
        <p className="print-hidden pt-4 text-center text-xs text-slate-500">
          Utilize o botao &quot;Imprimir / PDF&quot; para salvar este documento com margens otimizadas.
        </p>
      </Card>
    </div>
  );
}
