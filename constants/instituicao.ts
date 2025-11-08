export type FooterLogo = {
  label: string;
  logoUrl: string;
};

export type InstitutionalIdentity = {
  sigla: string;
  secretaria: string;
  orgao: string;
  escola: string;
  cnpj: string;
  endereco: string;
  cidadeEstado: string;
  contatos: string;
  emailInstitucional: string;
  logoUrl?: string;
  governo?: string;
  headerTagline?: string;
  backgroundTopUrl?: string;
  footerLogos?: FooterLogo[];
  footerNotes?: string[];
};

export const institutionalIdentity: InstitutionalIdentity = {
  sigla: "EETI",
  secretaria: "Secretaria de Educação e Desporto",
  orgao: "SEDUC - Projeto Consciência Negra 2025",
  escola: "EETI Professor Raimundo Benedito Costa",
  cnpj: "CNPJ 00.000.000/0001-00",
  endereco: "Av. Principal 123 - Boa Vista do Ramos - AM",
  cidadeEstado: "Boa Vista do Ramos - AM",
  contatos: "(92) 99999-0000",
  emailInstitucional: "secretaria@seduc.am.gov.br",
  governo: "Governo do Amazonas",
  headerTagline: "Educação que transforma",
  logoUrl: "/logos/brasao_amazonas.svg",
  backgroundTopUrl: "/logos/timbrado-top.svg",
  footerLogos: [
    { label: "Governo do Amazonas", logoUrl: "/logos/logo-governo.svg" },
    { label: "Secretaria de Educação e Desporto", logoUrl: "/logos/logo-seduc.svg" }
  ],
  footerNotes: [
    "www.educacao.am.gov.br • instagram.com/educacaoam",
    "facebook.com/educacaoam • atendimento@seduc.am.gov.br"
  ]
};
