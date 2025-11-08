import Image from "next/image";
import { institutionalIdentity } from "@/constants/instituicao";

export type OficioSignature = {
  nome: string;
  cargo: string;
  registro?: string;
  imageUrl?: string;
};

export type OficioTemplateProps = {
  numero?: string;
  assunto: string;
  destinatario: string;
  cargoDestinatario?: string;
  corpo: string;
  localData: string;
  anexos?: string[];
  observacoes?: string;
  assinatura: OficioSignature;
  anoReferencia?: string;
  logoUrl?: string;
};

function getParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function OficioTemplate({
  numero,
  assunto,
  destinatario,
  cargoDestinatario,
  corpo,
  localData,
  anexos,
  observacoes,
  assinatura,
  anoReferencia,
  logoUrl
}: OficioTemplateProps) {
  const identity = {
    ...institutionalIdentity,
    logoUrl: logoUrl ?? institutionalIdentity.logoUrl
  };
  const paragraphs = getParagraphs(corpo);
  const attachments = anexos?.filter((item) => item.trim().length > 0) ?? [];
  const numeroFormatado = numero?.trim().length ? numero : "S/N";
  const ano = anoReferencia ?? new Date().getFullYear().toString();
  const mostrarAnoSeparado = !numeroFormatado.includes(ano);
  const numeroParaReferencia = mostrarAnoSeparado ? `${numeroFormatado}/${ano}` : numeroFormatado;

  return (
    <article className="oficio oficio--timbrado" aria-label="Template de oficio">
      {identity.backgroundTopUrl && (
        <div aria-hidden="true" className="oficio-top-banner" style={{ backgroundImage: `url(${identity.backgroundTopUrl})` }} />
      )}
      <header className="oficio-header">
        <div className="oficio-header__logo-area" aria-hidden="true">
          <div className="oficio-header__logo">
            {identity.logoUrl ? (
              <Image alt={`Logo ${identity.secretaria}`} height={130} priority src={identity.logoUrl} width={130} />
            ) : (
              <div className="oficio-logo-fallback">{identity.sigla}</div>
            )}
          </div>
          {identity.governo && <p className="oficio-government">{identity.governo}</p>}
        </div>
        <div className="oficio-header__identity">
          <p className="oficio-secretaria">{identity.secretaria}</p>
          <p className="oficio-escola">{identity.escola}</p>
          {identity.headerTagline && <p className="oficio-tagline">{identity.headerTagline}</p>}
          <p className="oficio-meta">{identity.orgao}</p>
          <p className="oficio-meta">{identity.cnpj}</p>
        </div>
        <div className="oficio-header__number">
          <p className="oficio-label">Oficio</p>
          <strong>{numeroFormatado}</strong>
          {mostrarAnoSeparado && <span className="oficio-meta">{ano}</span>}
        </div>
      </header>

      <section className="oficio-info">
        <p>
          {identity.cidadeEstado}, {localData}
        </p>
      </section>

      <section className="oficio-reference">
        <p className="oficio-reference__code">
          <span>OFICIO Nº {numeroParaReferencia}</span>
          <span className="oficio-reference__context"> • {identity.sigla} / {identity.orgao}</span>
        </p>
        <p className="oficio-reference__subject">{assunto.toUpperCase()}</p>
      </section>

      <section className="oficio-recipient">
        <p className="oficio-recipient__label">À</p>
        <p className="oficio-recipient__name">{destinatario}</p>
        {cargoDestinatario && <p className="oficio-recipient__role">{cargoDestinatario}</p>}
      </section>

      <main className="oficio-body">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </main>

      {attachments.length > 0 && (
        <section className="oficio-attachments">
          <p>
            <strong>Anexos:</strong>
          </p>
          <ul>
            {attachments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {observacoes && (
        <section className="oficio-observacoes">
          <p>
            <strong>Observacoes:</strong> {observacoes}
          </p>
        </section>
      )}

      <section className="oficio-signature">
        {assinatura.imageUrl && (
          <Image alt={`Assinatura de ${assinatura.nome}`} height={70} src={assinatura.imageUrl} width={220} />
        )}
        <p className="oficio-signature__name">{assinatura.nome}</p>
        <p className="oficio-meta">{assinatura.cargo}</p>
        {assinatura.registro && <p className="oficio-meta">{assinatura.registro}</p>}
      </section>

      <footer className="oficio-footer">
        <div className="oficio-footer__content">
          <div className="oficio-footer__info">
            <p>{identity.endereco}</p>
            <p>
              {identity.contatos} - {identity.emailInstitucional}
            </p>
            {identity.footerNotes?.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
          {identity.footerLogos && identity.footerLogos.length > 0 && (
            <div className="oficio-footer__logos">
              {identity.footerLogos.map((logo) => (
                <div className="oficio-footer__logo" key={logo.label}>
                  <Image alt={logo.label} height={60} src={logo.logoUrl} width={160} />
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>
    </article>
  );
}
