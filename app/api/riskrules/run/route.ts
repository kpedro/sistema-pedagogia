import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk } from "@/lib/api";
import { USER_ROLE } from "@/constants/enums";
import { runRiskRules } from "@/lib/risk-rules";

export async function POST(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.PEDAGOGO]
  });
  if ("response" in auth) return auth.response;

  const result = await runRiskRules({ prisma, schoolId: auth.schoolId, actor: auth.user });
  return jsonOk({ result });
}
