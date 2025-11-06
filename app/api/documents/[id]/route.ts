import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { DOCUMENT_STATUS_ENUM, USER_ROLE } from "@/constants/enums";
import type { DocumentStatus } from "@/constants/enums";
import { z } from "zod";
import { reserveDocumentNumber, finalizeDocumentNumber, recordRevision } from "@/lib/documents";

const updateSchema = z.object({
  content: z.string().min(10),
  metadata: z.record(z.any()).optional(),
  changelog: z.string().optional()
});

const actionSchema = z.object({
  action: z.enum(["submit", "approve", "archive", "reopen"]),
  changelog: z.string().optional()
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Dados invalidos", 422, { issues: parsed.error.flatten() });
  }

  const document = await prisma.$transaction(async (tx) => {
    const updated = await tx.document.update({
      where: { id: params.id },
      data: {
        content: parsed.data.content,
        metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null,
        updatedAt: new Date()
      }
    });

    await reserveDocumentNumber(tx, {
      documentId: updated.id,
      schoolId: auth.schoolId,
      type: updated.type
    });

    const nextVersion = updated.version + 1;

    await tx.document.update({
      where: { id: updated.id },
      data: { version: nextVersion }
    });

    await recordRevision(tx, {
      documentId: updated.id,
      version: nextVersion,
      status: updated.status as DocumentStatus,
      content: parsed.data.content,
      changelog: parsed.data.changelog ?? "Atualizacao",
      authorId: auth.user.id
    });

    return { ...updated, version: nextVersion };
  });

  return jsonOk({ document });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  const body = await req.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Acao invalida", 422, { issues: parsed.error.flatten() });
  }

  const document = await prisma.document.findUnique({ where: { id: params.id } });

  if (!document || document.schoolId !== auth.schoolId) {
    return jsonError("Documento nao encontrado", 404);
  }

  switch (parsed.data.action) {
    case "submit": {
      if (document.status !== DOCUMENT_STATUS_ENUM.DRAFT) {
        return jsonError("Documento ja em fluxo de aprovacao", 409);
      }
      const updated = await prisma.document.update({
        where: { id: params.id },
        data: { status: DOCUMENT_STATUS_ENUM.REVIEW }
      });
      return jsonOk({ document: updated });
    }
    case "approve": {
      if (document.status !== DOCUMENT_STATUS_ENUM.REVIEW) {
        return jsonError("Documento precisa estar em revisao", 409);
      }
      const number = await prisma.$transaction((tx) =>
        finalizeDocumentNumber(tx, {
          documentId: params.id,
          schoolId: auth.schoolId,
          type: document.type,
          approverId: auth.user.id
        })
      );
      const approved = await prisma.document.findUnique({ where: { id: params.id } });
      return jsonOk({ document: approved, number });
    }
    case "archive": {
      const archived = await prisma.document.update({
        where: { id: params.id },
        data: {
          status: DOCUMENT_STATUS_ENUM.ARCHIVED,
          archivedAt: new Date()
        }
      });
      return jsonOk({ document: archived });
    }
    case "reopen": {
      if (document.status !== DOCUMENT_STATUS_ENUM.APPROVED) {
        return jsonError("Somente documentos aprovados podem ser reabertos", 409);
      }
      const reopened = await prisma.document.update({
        where: { id: params.id },
        data: {
          status: DOCUMENT_STATUS_ENUM.DRAFT,
          version: document.version + 1,
          number: document.number,
          provisionalNumber: null,
          reservedUntil: null
        }
      });
      return jsonOk({ document: reopened });
    }
    default:
      return jsonError("Acao nao suportada", 400);
  }
}
