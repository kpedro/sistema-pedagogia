import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  const [students, classes, templates] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId: auth.schoolId },
      select: {
        id: true,
        name: true,
        registration: true,
        classId: true,
        class: { select: { id: true, name: true } }
      },
      orderBy: { name: "asc" }
    }),
    prisma.class.findMany({
      where: { schoolId: auth.schoolId },
      select: {
        id: true,
        name: true,
        grade: true,
        shift: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.template.findMany({
      where: {
        OR: [{ schoolId: auth.schoolId }, { schoolId: null }]
      },
      select: {
        id: true,
        title: true,
        code: true,
        type: true,
        schoolId: true
      },
      orderBy: [{ schoolId: "desc" }, { title: "asc" }]
    })
  ]);

  return jsonOk({
    students: students.map((student) => ({
      id: student.id,
      name: student.name,
      registration: student.registration,
      classId: student.classId,
      className: student.class?.name ?? null
    })),
    classes,
    templates
  });
}
