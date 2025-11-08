import { cn } from "@/lib/utils";

const toList = (values: string[]) => values.map((item) => item.trim()).filter(Boolean);

export type AtaTemplateProps = {
  titulo: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  presentes: string[];
  pautas: string[];
  deliberacoes: string[];
  observacoes?: string;
  responsavel: string;
};

export function AtaTemplate({
  titulo,
  data,
  horaInicio,
  horaFim,
  local,
  presentes,
  pautas,
  deliberacoes,
  observacoes,
  responsavel
}: AtaTemplateProps) {
  const presentesList = toList(presentes);
  const pautasList = toList(pautas);
  const deliberacoesList = toList(deliberacoes);

  return (
    <article className="doc-sheet ata-sheet" aria-label="Modelo de ata">
      <header className="doc-sheet__header">
        <div>
          <p className="doc-sheet__label">Ata</p>
          <h1>{titulo}</h1>
        </div>
        <div className="doc-sheet__meta">
          <span>{data}</span>
          <span>
            {horaInicio} - {horaFim}
          </span>
          <span>{local}</span>
        </div>
      </header>

      <section className="doc-sheet__section">
        <h2>Participantes</h2>
        <ul>
          {presentesList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="doc-sheet__section">
        <h2>Pautas</h2>
        <ul>
          {pautasList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="doc-sheet__section">
        <h2>Deliberações</h2>
        <ul>
          {deliberacoesList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {observacoes && (
        <section className="doc-sheet__section">
          <h2>Observações</h2>
          <p>{observacoes}</p>
        </section>
      )}

      <footer className="doc-sheet__footer">
        <p>Responsável pela ata</p>
        <strong>{responsavel}</strong>
      </footer>
    </article>
  );
}

export type ComunicadoTemplateProps = {
  titulo: string;
  destinatario: string;
  mensagem: string;
  emissor: string;
  data: string;
  contato?: string;
};

export function ComunicadoTemplate({ titulo, destinatario, mensagem, emissor, data, contato }: ComunicadoTemplateProps) {
  const paragraphs = mensagem
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <article className="doc-sheet comunicado-sheet" aria-label="Modelo de comunicado">
      <header className="doc-sheet__header">
        <div>
          <p className="doc-sheet__label">Comunicado</p>
          <h1>{titulo}</h1>
        </div>
        <div className="doc-sheet__meta">
          <span>{data}</span>
        </div>
      </header>

      <section className="doc-sheet__section">
        <h2>Destinatários</h2>
        <p>{destinatario}</p>
      </section>

      <section className="doc-sheet__section">
        <h2>Mensagem</h2>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <footer className="doc-sheet__footer">
        <div>
          <p>Atenciosamente,</p>
          <strong>{emissor}</strong>
        </div>
        {contato && <p className="doc-sheet__meta">{contato}</p>}
      </footer>
    </article>
  );
}

export type RegistroTemplateProps = {
  numero: string;
  data: string;
  local: string;
  envolvidos: string[];
  descricao: string;
  medidas: string[];
  responsavel: string;
};

export function RegistroTemplate({ numero, data, local, envolvidos, descricao, medidas, responsavel }: RegistroTemplateProps) {
  return (
    <article className={cn("doc-sheet registro-sheet")} aria-label="Modelo de registro de ocorrência">
      <header className="doc-sheet__header">
        <div>
          <p className="doc-sheet__label">Registro de ocorrência</p>
          <h1>{numero}</h1>
        </div>
        <div className="doc-sheet__meta">
          <span>{data}</span>
          <span>{local}</span>
        </div>
      </header>

      <section className="doc-sheet__section">
        <h2>Envolvidos</h2>
        <ul>
          {envolvidos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="doc-sheet__section">
        <h2>Resumo do fato</h2>
        <p>{descricao}</p>
      </section>

      <section className="doc-sheet__section">
        <h2>Medidas adotadas</h2>
        <ul>
          {medidas.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <footer className="doc-sheet__footer">
        <p>Responsável</p>
        <strong>{responsavel}</strong>
      </footer>
    </article>
  );
}
