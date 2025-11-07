import { createPrismaClient } from "../lib/prisma";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { USER_ROLE, OCCURRENCE_CATEGORY, type OccurrenceCategory } from "../constants/enums";

const prisma = createPrismaClient();

const SCHOOLS = [
  {
    code: "EETI_RBC",
    name: "Escola Estadual de Tempo Integral Raimundo Brito da Costa",
    shortName: "EETI RBC",
    address: "Av. das Flores, 123 - Manaus/AM",
    timezone: "America/Manaus",
    themePrimary: "#2563eb",
    themeSecondary: "#0f172a"
  },
  {
    code: "EE_GBS",
    name: "Escola Estadual Getulio Vargas",
    shortName: "EE GBS",
    address: "Rua Rio Negro, 987 - Manaus/AM",
    timezone: "America/Manaus",
    themePrimary: "#16a34a",
    themeSecondary: "#14532d"
  }
];

const OCCURRENCE_CATALOG: Array<{
  category: OccurrenceCategory;
  subtype: string;
  defaultSeverity: number;
  defaultConfidential: boolean;
  description: string;
}> = [
  {
    category: OCCURRENCE_CATEGORY.INDISCIPLINA,
    subtype: "Comportamento inadequado em sala",
    defaultSeverity: 3,
    defaultConfidential: false,
    description: "Condutas que comprometem o andamento da aula."
  },
  {
    category: OCCURRENCE_CATEGORY.ATRASO_FALTA,
    subtype: "Atraso recorrente",
    defaultSeverity: 2,
    defaultConfidential: false,
    description: "Atrasos acima de 3 vezes na semana."
  },
  {
    category: OCCURRENCE_CATEGORY.CONFLITO,
    subtype: "Conflito entre estudantes",
    defaultSeverity: 3,
    defaultConfidential: true,
    description: "Discussoes ou agressões verbais/fisicas."
  },
  {
    category: OCCURRENCE_CATEGORY.PEDAGOGICA,
    subtype: "Necessidade de reforco",
    defaultSeverity: 2,
    defaultConfidential: false,
    description: "IndicIos de defasagem de aprendizagem."
  },
  {
    category: OCCURRENCE_CATEGORY.PATRIMONIO,
    subtype: "Dano ao patrimonio",
    defaultSeverity: 4,
    defaultConfidential: true,
    description: "Danos a equipamentos ou instalacoes."
  },
  {
    category: OCCURRENCE_CATEGORY.SAUDE_BEM_ESTAR,
    subtype: "Incidente de saude",
    defaultSeverity: 5,
    defaultConfidential: true,
    description: "Casos que exigem atencao imediata da equipe de saude."
  }
];

const SUBJECTS = [
  { code: "MAT", name: "Matematica", color: "#2563eb" },
  { code: "POR", name: "Lingua Portuguesa", color: "#7c3aed" },
  { code: "CIE", name: "Ciencias", color: "#0ea5e9" },
  { code: "HIS", name: "Historia", color: "#f97316" },
  { code: "GEO", name: "Geografia", color: "#16a34a" }
];

const CLASS_SETS: Record<
  string,
  Array<{ code: string; name: string; grade: string; shift: string; year: number }>
> = {
  EETI_RBC: [
    { code: "1A", name: "1º ano A", grade: "1º EM", shift: "MATUTINO", year: 2025 },
    { code: "2B", name: "2º ano B", grade: "2º EM", shift: "VESPERTINO", year: 2025 }
  ],
  EE_GBS: [
    { code: "7A", name: "7º ano A", grade: "7º EF", shift: "MATUTINO", year: 2025 },
    { code: "9C", name: "9º ano C", grade: "9º EF", shift: "VESPERTINO", year: 2025 }
  ]
};

type GuardianSeed = {
  name: string;
  relation: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
};

type StudentSeed = {
  name: string;
  registration: string;
  classCode?: string;
  birthDate?: string;
  gender?: string;
  contactEmail?: string;
  contactPhone?: string;
  guardians?: GuardianSeed[];
};

const STUDENT_SETS: Record<string, StudentSeed[]> = {
  EETI_RBC: [
    {
      name: "Ana Beatriz Souza",
      registration: "EETI-RBC-2025-001",
      classCode: "1A",
      birthDate: "2010-03-12",
      gender: "F",
      contactEmail: "ana.souza@familia.com",
      contactPhone: "+55 92 99999-1101",
      guardians: [
        { name: "Marcia Souza", relation: "MAE", email: "marcia@familia.com", phone: "+55 92 99999-1100", isPrimary: true }
      ]
    },
    {
      name: "Rafael Pereira",
      registration: "EETI-RBC-2025-002",
      classCode: "1A",
      birthDate: "2009-11-05",
      gender: "M",
      contactPhone: "+55 92 98888-2212",
      guardians: [
        { name: "Carlos Pereira", relation: "PAI", phone: "+55 92 98888-2211", isPrimary: true },
        { name: "Luciana Pereira", relation: "MAE", phone: "+55 92 98888-2213" }
      ]
    },
    {
      name: "Luiza Carvalho",
      registration: "EETI-RBC-2025-003",
      classCode: "2B",
      birthDate: "2008-07-19",
      gender: "F",
      contactEmail: "luiza.carvalho@familia.com",
      guardians: [{ name: "Renata Carvalho", relation: "RESPONSAVEL", email: "renata.carvalho@mail.com", isPrimary: true }]
    }
  ],
  EE_GBS: [
    {
      name: "Miguel Andrade",
      registration: "EE-GBS-2025-101",
      classCode: "7A",
      birthDate: "2012-01-22",
      gender: "M",
      guardians: [
        { name: "Paula Andrade", relation: "MAE", phone: "+55 92 97777-3000", isPrimary: true },
        { name: "Roberto Andrade", relation: "PAI", phone: "+55 92 97777-3001" }
      ]
    },
    {
      name: "Helena Torres",
      registration: "EE-GBS-2025-102",
      classCode: "7A",
      birthDate: "2011-08-03",
      gender: "F",
      contactEmail: "helena.torres@familia.com",
      guardians: [{ name: "Juliana Torres", relation: "MAE", email: "juliana.torres@mail.com", isPrimary: true }]
    },
    {
      name: "Caio Mendes",
      registration: "EE-GBS-2025-103",
      classCode: "9C",
      birthDate: "2010-04-14",
      gender: "M",
      guardians: [{ name: "Fernanda Mendes", relation: "RESPONSAVEL", phone: "+55 92 96666-4411", isPrimary: true }]
    }
  ]
};
const TEMPLATES = [
  {
    code: "RO",
    type: "RO",
    title: "Registro de Ocorrencia",
    changelog: "Versao inicial MVP",
    html: `<section>
  <header>
    <h1>{{doc.titulo}}</h1>
    <p>Documento nº {{doc.numero}}  {{data}} {{hora}}</p>
    <p>{{escola.nome}}  {{escola.endereco}}</p>
  </header>
  <article>
    <p>Aluno(a): {{aluno.nome}} ({{aluno.matricula}})  Turma {{turma.nome}}</p>
    <p>Responsavel: {{responsavel.nome}} ({{responsavel.relacao}})</p>
    <div class="conteudo">{{url}}</div>
  </article>
  <footer>
    <p>{{assinatura}}</p>
  </footer>
</section>`
  },
  {
    code: "ATA",
    type: "ATA",
    title: "Ata de Reuniao",
    changelog: "Versao inicial MVP",
    html: `<article>
  <header>
    <h1>{{doc.titulo}}</h1>
    <p>Nº {{doc.numero}}  {{escola.nome}}  {{data}} as {{hora}}</p>
  </header>
  <section class="corpo">
    <p>Participantes: {{usuario.nome}}</p>
    <p>Local: {{escola.endereco}}</p>
    <div>{{url}}</div>
  </section>
  <footer>
    <p>Validado por {{assinatura}}</p>
  </footer>
</article>`
  },
  {
    code: "OF",
    type: "OF",
    title: "Oficio",
    changelog: "Versao inicial MVP",
    html: `<div>
  <p>{{escola.nome}}  {{escola.endereco}}</p>
  <p>Oficio nº {{doc.numero}}</p>
  <p>{{data}}</p>
  <div>{{url}}</div>
  <p>Atenciosamente, {{usuario.nome}}</p>
</div>`
  },
  {
    code: "PLA",
    type: "PLA",
    title: "Plano de Aula",
    changelog: "Versao inicial MVP",
    html: `<section>
  <header>
    <p>{{escola.sigla}}  {{doc.numero}}</p>
    <h1>{{doc.titulo}}</h1>
    <p>Disciplina: {{disciplina.sigla}}  Turma: {{turma.nome}}</p>
  </header>
  <article>{{url}}</article>
  <footer>{{assinatura}}</footer>
</section>`
  },
  {
    code: "COM",
    type: "COM",
    title: "Comunicado",
    changelog: "Versao inicial MVP",
    html: `<section>
  <header>
    <h1>{{doc.titulo}}</h1>
    <p>{{escola.nome}}  {{data}}</p>
  </header>
  <article>{{url}}</article>
  <footer>{{assinatura}}</footer>
</section>`
  }
];

const DEFAULT_RULES = [
  {
    name: "Alerta - Media abaixo de 6",
    definition: {
      matchMode: "ANY",
      conditions: [
        {
          metric: "average",
          comparator: "<",
          threshold: 6,
          period: "ultimo_bimestre",
          severity: 3,
          summary: "Media geral abaixo de 6"
        }
      ]
    }
  },
  {
    name: "Alerta - Frequencia abaixo de 85%",
    definition: {
      matchMode: "ANY",
      conditions: [
        {
          metric: "attendance",
          comparator: "<",
          threshold: 85,
          period: "ultimo_bimestre",
          severity: 4,
          summary: "Frequencia inferior a 85%"
        }
      ]
    }
  },
  {
    name: "Alerta - Ocorrencias graves",
    definition: {
      matchMode: "ANY",
      conditions: [
        {
          metric: "occurrences",
          comparator: ">=",
          threshold: 2,
          windowDays: 30,
          severity: 5,
          summary: "Ocorrencias de gravidade >=4 nos ultimos 30 dias"
        }
      ]
    }
  }
];

async function main() {
  const schoolMap: Record<string, { id: string; name: string; code: string }> = {};

  for (const school of SCHOOLS) {
    const stored = await prisma.school.upsert({
      where: { code: school.code },
      update: {
        name: school.name,
        shortName: school.shortName,
        address: school.address,
        themePrimary: school.themePrimary,
        themeSecondary: school.themeSecondary,
        timezone: school.timezone
      },
      create: { ...school }
    });
    schoolMap[stored.code] = stored;
  }

  const adminSecret = speakeasy.generateSecret({
    length: 32,
    name: "MVP Pedagogia Admin (EETI_RBC)"
  });

  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@eeti.rbc.br" },
    update: {
      passwordHash: adminPasswordHash,
      name: "Admin Principal",
      totpSecret: adminSecret.base32,
      totpEnabled: true,
      role: USER_ROLE.ADMIN,
      isActive: true
    },
    create: {
      email: "admin@eeti.rbc.br",
      name: "Admin Principal",
      passwordHash: adminPasswordHash,
      totpSecret: adminSecret.base32,
      totpEnabled: true,
      role: USER_ROLE.ADMIN
    }
  });

  await prisma.userSchool.upsert({
    where: {
      userId_schoolId: { userId: adminUser.id, schoolId: schoolMap.EETI_RBC.id }
    },
    update: { role: USER_ROLE.ADMIN, isPrimary: true },
    create: {
      userId: adminUser.id,
      schoolId: schoolMap.EETI_RBC.id,
      role: USER_ROLE.ADMIN,
      isPrimary: true
    }
  });

  await prisma.userSchool.upsert({
    where: {
      userId_schoolId: { userId: adminUser.id, schoolId: schoolMap.EE_GBS.id }
    },
    update: { role: USER_ROLE.GESTOR },
    create: {
      userId: adminUser.id,
      schoolId: schoolMap.EE_GBS.id,
      role: USER_ROLE.GESTOR
    }
  });

  const classMap: Record<string, Record<string, { id: string }>> = {};

  for (const [schoolCode, classList] of Object.entries(CLASS_SETS)) {
    const school = schoolMap[schoolCode];
    if (!school) continue;
    classMap[schoolCode] = {};

    for (const cls of classList) {
      const storedClass = await prisma.class.upsert({
        where: {
          schoolId_name: {
            schoolId: school.id,
            name: cls.name
          }
        },
        update: {
          code: cls.code,
          grade: cls.grade,
          shift: cls.shift,
          year: cls.year
        },
        create: {
          schoolId: school.id,
          code: cls.code,
          name: cls.name,
          grade: cls.grade,
          shift: cls.shift,
          year: cls.year
        }
      });

      classMap[schoolCode][cls.code] = { id: storedClass.id };
    }
  }

  for (const [schoolCode, students] of Object.entries(STUDENT_SETS)) {
    const school = schoolMap[schoolCode];
    if (!school) continue;

    for (const student of students) {
      const classId = student.classCode ? classMap[schoolCode]?.[student.classCode]?.id ?? null : null;

      const storedStudent = await prisma.student.upsert({
        where: { registration: student.registration },
        update: {
          name: student.name,
          classId,
          birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
          gender: student.gender,
          contactEmail: student.contactEmail,
          contactPhone: student.contactPhone
        },
        create: {
          schoolId: school.id,
          classId,
          name: student.name,
          registration: student.registration,
          birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
          gender: student.gender,
          enrollmentDate: new Date(),
          contactEmail: student.contactEmail,
          contactPhone: student.contactPhone
        }
      });

      for (const guardianData of student.guardians ?? []) {
        let guardian = await prisma.guardian.findFirst({
          where: {
            name: guardianData.name,
            relation: guardianData.relation
          }
        });

        if (!guardian) {
          guardian = await prisma.guardian.create({
            data: {
              name: guardianData.name,
              relation: guardianData.relation,
              email: guardianData.email,
              phone: guardianData.phone
            }
          });
        } else {
          guardian = await prisma.guardian.update({
            where: { id: guardian.id },
            data: {
              email: guardianData.email ?? guardian.email,
              phone: guardianData.phone ?? guardian.phone
            }
          });
        }

        await prisma.studentGuardian.upsert({
          where: {
            studentId_guardianId: {
              studentId: storedStudent.id,
              guardianId: guardian.id
            }
          },
          update: {
            isPrimary: guardianData.isPrimary ?? false
          },
          create: {
            studentId: storedStudent.id,
            guardianId: guardian.id,
            isPrimary: guardianData.isPrimary ?? false
          }
        });
      }
    }
  }

  for (const catalogItem of OCCURRENCE_CATALOG) {
    const existingCatalog = await prisma.occurrenceCatalog.findFirst({
      where: {
        schoolId: null,
        category: catalogItem.category,
        subtype: catalogItem.subtype
      }
    });

    if (existingCatalog) {
      await prisma.occurrenceCatalog.update({
        where: { id: existingCatalog.id },
        data: {
          defaultSeverity: catalogItem.defaultSeverity,
          defaultConfidential: catalogItem.defaultConfidential,
          description: catalogItem.description
        }
      });
    } else {
      await prisma.occurrenceCatalog.create({
        data: {
          schoolId: null,
          category: catalogItem.category,
          subtype: catalogItem.subtype,
          defaultSeverity: catalogItem.defaultSeverity,
          defaultConfidential: catalogItem.defaultConfidential,
          description: catalogItem.description
        }
      });
    }
  }

  for (const school of Object.values(schoolMap)) {
    for (const subject of SUBJECTS) {
      await prisma.subject.upsert({
        where: {
          schoolId_code: {
            schoolId: school.id,
            code: subject.code
          }
        },
        update: {
          name: subject.name,
          color: subject.color
        },
        create: {
          schoolId: school.id,
          code: subject.code,
          name: subject.name,
          color: subject.color
        }
      });
    }

    for (const rule of DEFAULT_RULES) {
      await prisma.riskRuleConfig.upsert({
        where: {
          schoolId_name: {
            schoolId: school.id,
            name: rule.name
          }
        },
        update: {
          definition: JSON.stringify(rule.definition)
        },
        create: {
          schoolId: school.id,
          name: rule.name,
          definition: JSON.stringify(rule.definition),
          createdById: adminUser.id
        }
      });
    }
  }

  for (const template of TEMPLATES) {
    const placeholders = JSON.stringify([
      "{{escola.nome}}",
      "{{escola.sigla}}",
      "{{escola.endereco}}",
      "{{aluno.nome}}",
      "{{aluno.matricula}}",
      "{{turma.nome}}",
      "{{disciplina.sigla}}",
      "{{data}}",
      "{{hora}}",
      "{{responsavel.nome}}",
      "{{responsavel.relacao}}",
      "{{assinatura}}",
      "{{doc.numero}}",
      "{{doc.titulo}}",
      "{{usuario.nome}}",
      "{{url}}"
    ]);

    const existingTemplate = await prisma.template.findFirst({
      where: {
        schoolId: null,
        code: template.code,
        version: 1
      }
    });

    if (existingTemplate) {
      await prisma.template.update({
        where: { id: existingTemplate.id },
        data: {
          title: template.title,
          changelog: template.changelog,
          html: template.html,
          placeholders
        }
      });
    } else {
      await prisma.template.create({
        data: {
          schoolId: null,
          code: template.code,
          title: template.title,
          type: template.type,
          version: 1,
          changelog: template.changelog,
          html: template.html,
          placeholders,
          createdById: adminUser.id
        }
      });
    }
  }

  console.log("Seed executado com sucesso.");
  console.log("Admin: admin@eeti.rbc.br / Senha: Admin@123");
  console.log("Configure o TOTP com o segredo:", adminSecret.base32);
  console.log("URL OTP:", adminSecret.otpauth_url);
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


