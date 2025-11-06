import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { INTERVENTION_STATUS_ENUM, USER_ROLE } from "@/constants/enums";
import { z } from "zod";

const updateSchema = z.object({
  status: z.nativeEnum(INTERVENTION_STATUS_ENUM).optional(),
  plan: z.string().optional(),
  summary: z.string().optional(),
  followUpAt: z.coerce.date().optional(),
  assignedToId: z.string().nullable().optional()
});

export async function PATCH(
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

  const intervention = await prisma.intervention.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      assignedToId: parsed.data.assignedToId ?? undefined
    }
  });

  await prisma.auditLog.create({
    data: {
      schoolId: auth.schoolId,
      action: "UPDATE",
      actorId: auth.user.id,
      target: params.id,
      summary: "Intervencao atualizada",
      payload: JSON.stringify(parsed.data)
    }
  });

  return jsonOk({ intervention });
}
