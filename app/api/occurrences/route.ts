import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { OCCURRENCE_CATEGORY, USER_ROLE, type OccurrenceStatus } from "@/constants/enums";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { appendOccurrenceToSheet } from "@/lib/googleSheets";

const createSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().optional(),
  category: z.nativeEnum(OCCURRENCE_CATEGORY),
  subtype: z.string().min(2),
  severity: z.coerce.number().min(1).max(5),
  description: z.string().min(5),
  actionsTaken: z.string().optional(),
  happenedAt: z.coerce.date(),
  isConfidential: z.boolean().optional()
});

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const status = url.searchParams.get("status") as OccurrenceStatus | null;

  const occurrences = await prisma.occurrence.findMany({
    where: {
      schoolId: auth.schoolId,
      studentId: studentId ?? undefined,
      status: status ?? undefined
    },
    orderBy: { happenedAt: "desc" },
    include: {
      student: { select: { id: true, name: true, registration: true } },
      class: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } }
    },
    take: 200
  });

  const normalized = occurrences.map((occurrence) => {
    const { metadata, ...rest } = occurrence;
    let sheetUrl: string | undefined;
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        if (parsed && typeof parsed.sheetUrl === "string") {
          sheetUrl = parsed.sheetUrl;
        }
      } catch {
        sheetUrl = undefined;
      }
    }
    return { ...rest, sheetUrl };
  });

  return jsonOk({ occurrences: normalized });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO, USER_ROLE.PROFESSOR]
  });
  if ("response" in auth) return auth.response;

  try {
    enforceRateLimit(`occurrence:${auth.user.id}`, Number(process.env.RATE_LIMIT_CRITICAL ?? 30));
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

  const data = parsed.data;

  const occurrence = await prisma.occurrence.create({
    data: {
      schoolId: auth.schoolId,
      studentId: data.studentId,
      classId: data.classId,
      createdById: auth.user.id,
      category: data.category,
      subtype: data.subtype,
      severity: data.severity,
      description: data.description,
      actionsTaken: data.actionsTaken,
      happenedAt: data.happenedAt,
      isConfidential: data.isConfidential ?? false
    },
    include: {
      student: { select: { name: true } },
      class: { select: { name: true } },
      createdBy: { select: { name: true } }
    }
  });

  const sheetRow = [
    new Date(data.happenedAt).toLocaleString("pt-BR"),
    occurrence.student?.name ?? "",
    occurrence.class?.name ?? "",
    data.category,
    data.subtype,
    String(data.severity),
    data.description,
    data.actionsTaken ?? "",
    occurrence.createdBy?.name ?? "",
    occurrence.id
  ];

  const sheetResult = await appendOccurrenceToSheet(sheetRow).catch(() => null);

  if (sheetResult?.sheetUrl) {
    await prisma.occurrence.update({
      where: { id: occurrence.id },
      data: { metadata: JSON.stringify({ sheetUrl: sheetResult.sheetUrl }) }
    });
  }

  await prisma.auditLog.create({
    data: {
      schoolId: auth.schoolId,
      action: "CREATE",
      actorId: auth.user.id,
      target: occurrence.id,
      summary: `Ocorrencia ${occurrence.category}/${occurrence.subtype}`,
      payload: JSON.stringify(occurrence)
    }
  });

  return jsonOk({ occurrence }, { status: 201 });
}
