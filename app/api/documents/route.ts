import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { DOCUMENT_STATUS_ENUM, USER_ROLE, type DocumentStatus } from "@/constants/enums";
import { z } from "zod";
import { reserveDocumentNumber, recordRevision } from "@/lib/documents";
import { enforceRateLimit } from "@/lib/rate-limit";

const createSchema = z.object({
  templateId: z.string().optional(),
  title: z.string().min(3),
  type: z.string().min(2),
  content: z.string().min(10),
  metadata: z.record(z.any()).optional()
});

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as DocumentStatus | null;

  const documents = await prisma.document.findMany({
    where: {
      schoolId: auth.schoolId,
      status: status ?? undefined
    },
    orderBy: { createdAt: "desc" },
    include: {
      template: { select: { id: true, code: true, title: true } },
      createdBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } }
    },
    take: 100
  });

  return jsonOk({ documents });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  try {
    enforceRateLimit(`documents:${auth.user.id}`, Number(process.env.RATE_LIMIT_CRITICAL ?? 30));
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return jsonError(error.message, (error as any).status ?? 429);
    }
    throw error;
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Dados invalidos", 422, { issues: parsed.error.flatten() });
  }

  const document = await prisma.$transaction(async (tx) => {
    const created = await tx.document.create({
      data: {
        schoolId: auth.schoolId,
        templateId: parsed.data.templateId ?? null,
        createdById: auth.user.id,
        status: DOCUMENT_STATUS_ENUM.DRAFT,
        type: parsed.data.type.toUpperCase(),
        title: parsed.data.title,
        content: parsed.data.content,
        metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null
      }
    });

    await reserveDocumentNumber(tx, {
      documentId: created.id,
      schoolId: auth.schoolId,
      type: parsed.data.type.toUpperCase()
    });

    await recordRevision(tx, {
      documentId: created.id,
      version: 1,
      status: DOCUMENT_STATUS_ENUM.DRAFT,
      content: parsed.data.content,
      changelog: "Versao inicial",
      authorId: auth.user.id
    });

    return created;
  });

  return jsonOk({ document }, { status: 201 });
}
