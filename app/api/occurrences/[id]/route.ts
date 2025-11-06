import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { OCCURRENCE_STATUS_ENUM, USER_ROLE } from "@/constants/enums";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";

const updateSchema = z.object({
  severity: z.coerce.number().min(1).max(5).optional(),
  description: z.string().min(5).optional(),
  actionsTaken: z.string().optional(),
  status: z.nativeEnum(OCCURRENCE_STATUS_ENUM).optional()
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, name: true, registration: true } },
      class: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      interventions: {
        select: {
          intervention: {
            select: { id: true, title: true, status: true }
          }
        }
      }
    }
  });

  if (!occurrence) {
    return jsonError("Ocorrencia nao encontrada", 404);
  }

  return jsonOk({ occurrence });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  try {
    enforceRateLimit(`occurrence-update:${auth.user.id}`, Number(process.env.RATE_LIMIT_CRITICAL ?? 30));
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return jsonError(error.message, (error as any).status ?? 429);
    }
    throw error;
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Dados invalidos", 422, { issues: parsed.error.flatten() });
  }

  const occurrence = await prisma.occurrence.update({
    where: { id: params.id },
    data: { ...parsed.data, updatedAt: new Date() }
  });

  await prisma.auditLog.create({
    data: {
      schoolId: auth.schoolId,
      action: "UPDATE",
      actorId: auth.user.id,
      target: params.id,
      summary: "Ocorrencia atualizada",
      payload: JSON.stringify(parsed.data)
    }
  });

  return jsonOk({ occurrence });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req, { roles: [USER_ROLE.ADMIN] });
  if ("response" in auth) return auth.response;

  await prisma.occurrence.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      schoolId: auth.schoolId,
      action: "DELETE",
      actorId: auth.user.id,
      target: params.id,
      summary: "Ocorrencia removida",
      payload: null
    }
  });

  return jsonOk({ ok: true });
}
