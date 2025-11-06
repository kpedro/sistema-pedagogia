import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  const users = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          schoolId: auth.schoolId
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      memberships: {
        where: { schoolId: auth.schoolId },
        select: {
          school: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const formatted = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.memberships[0]?.school ?? null
  }));

  return jsonOk({ users: formatted });
}
