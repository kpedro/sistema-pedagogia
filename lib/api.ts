import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/constants/enums";

export type UserMembership = {
  schoolId: string;
  role: UserRole;
  schoolName?: string;
  schoolCode?: string;
  isPrimary?: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId: string;
  schoolName?: string;
  schools: UserMembership[];
};

export async function requireUser(
  req: NextRequest,
  options?: { roles?: UserRole[] }
): Promise<
  | { user: AuthUser; schoolId: string; memberships: AuthUser["schools"]; response?: undefined }
  | { response: NextResponse }
> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.userId || !token.schoolId) {
    return {
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    };
  }

  const user: AuthUser = {
    id: token.userId as string,
    email: token.email as string,
    name: token.name as string,
    role: token.role as UserRole,
    schoolId: token.schoolId as string,
    schoolName: token.schoolName as string | undefined,
    schools: (token.schools as AuthUser["schools"]) ?? []
  };

  if (options?.roles && !options.roles.includes(user.role)) {
    return {
      response: NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    };
  }

  return {
    user,
    schoolId: user.schoolId,
    memberships: user.schools
  };
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}
