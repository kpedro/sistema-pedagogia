import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  const events = await prisma.event.findMany({
    where: { schoolId: auth.schoolId },
    orderBy: { startsAt: "desc" },
    take: 50
  });

  return jsonOk({ events });
}
