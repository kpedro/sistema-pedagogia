import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { INTERVENTION_STATUS_ENUM, USER_ROLE } from "@/constants/enums";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";

const createSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().optional(),
  title: z.string().min(5),
  summary: z.string().optional(),
  plan: z.string().optional(),
  followUpAt: z.coerce.date().optional(),
  status: z.nativeEnum(INTERVENTION_STATUS_ENUM).optional()
});

export async function GET(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  const interventions = await prisma.intervention.findMany({
    where: { schoolId: auth.schoolId },
    include: {
      student: { select: { id: true, name: true, registration: true } },
      class: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return jsonOk({ interventions });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  try {
    enforceRateLimit(`intervention:${auth.user.id}`, Number(process.env.RATE_LIMIT_CRITICAL ?? 30));
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

  const intervention = await prisma.intervention.create({
    data: {
      schoolId: auth.schoolId,
      studentId: parsed.data.studentId,
      classId: parsed.data.classId,
      createdById: auth.user.id,
      status: parsed.data.status ?? INTERVENTION_STATUS_ENUM.OPEN,
      title: parsed.data.title,
      summary: parsed.data.summary,
      plan: parsed.data.plan,
      followUpAt: parsed.data.followUpAt
    }
  });

  await prisma.auditLog.create({
    data: {
      schoolId: auth.schoolId,
      action: "CREATE",
      actorId: auth.user.id,
      target: intervention.id,
      summary: "Intervencao criada",
      payload: JSON.stringify({ title: intervention.title })
    }
  });

  return jsonOk({ intervention }, { status: 201 });
}
