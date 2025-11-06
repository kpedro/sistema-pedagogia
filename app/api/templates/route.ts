import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { USER_ROLE } from "@/constants/enums";
import { z } from "zod";

const templateSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(3),
  type: z.string().min(2),
  html: z.string().min(10),
  changelog: z.string().optional()
});

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  const templates = await prisma.template.findMany({
    where: {
      OR: [{ schoolId: auth.schoolId }, { schoolId: null }]
    },
    orderBy: [{ schoolId: "desc" }, { code: "asc" }],
    take: 100
  });

  return jsonOk({ templates });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR]
  });
  if ("response" in auth) return auth.response;

  const body = await req.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Dados inválidos", 422, { issues: parsed.error.flatten() });
  }

  const version =
    (await prisma.template.count({
      where: { schoolId: auth.schoolId, code: parsed.data.code }
    })) + 1;

  const template = await prisma.template.create({
    data: {
      schoolId: auth.schoolId,
      code: parsed.data.code,
      title: parsed.data.title,
      type: parsed.data.type,
      html: parsed.data.html,
      changelog: parsed.data.changelog ?? `Versão ${version}`,
      version,
      placeholders: JSON.stringify([
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
      ]),
      createdById: auth.user.id
    }
  });

  return jsonOk({ template }, { status: 201 });
}
