import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { USER_ROLE } from "@/constants/enums";
import { z } from "zod";

const updateSchema = z.object({
  html: z.string().min(10),
  changelog: z.string().optional()
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR]
  });
  if ("response" in auth) return auth.response;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Dados inválidos", 422, { issues: parsed.error.flatten() });
  }

  const template = await prisma.template.update({
    where: { id: params.id },
    data: {
      html: parsed.data.html,
      changelog: parsed.data.changelog ?? "Atualização",
      version: { increment: 1 }
    }
  });

  return jsonOk({ template });
}
