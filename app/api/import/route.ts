import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { USER_ROLE } from "@/constants/enums";
import { parseGradeCsv } from "@/lib/csv";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  const form = await req.formData();
  const file = form.get("file");
  const period = form.get("period")?.toString() ?? `ANO-${new Date().getFullYear()}`;

  if (!(file instanceof File)) {
    return jsonError("Arquivo ausente", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { parsed, errors } = parseGradeCsv(buffer);

  const result = await prisma.$transaction(async (tx) => {
    let processed = 0;

    for (const row of parsed) {
      const student = await tx.student.findFirst({
        where: {
          schoolId: auth.schoolId,
          registration: row.matricula
        }
      });

      if (!student) continue;

      await tx.studentMetric.upsert({
        where: { studentId_period: { studentId: student.id, period } },
        create: {
          schoolId: auth.schoolId,
          studentId: student.id,
          period,
          average: row.media,
          attendance: row.frequencia,
          severeOccurs30d: row.ocorrenciasGraves ?? 0
        },
        update: {
          average: row.media,
          attendance: row.frequencia,
          severeOccurs30d: row.ocorrenciasGraves ?? 0,
          lastComputedAt: new Date()
        }
      });

      processed += 1;
    }

    const log = await tx.csvImportLog.create({
      data: {
        schoolId: auth.schoolId,
        userId: auth.user.id,
        type: "GRADES",
        fileName: file.name,
        rowCount: parsed.length,
        processedCount: processed,
        errorCount: errors.length,
        log: JSON.stringify(errors)
      }
    });

    return { processed, log };
  });

  return jsonOk({
    processed: result.processed,
    errors,
    logId: result.log.id
  });
}
