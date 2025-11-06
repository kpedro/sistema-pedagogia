import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { USER_ROLE, type UserRole } from "@/constants/enums";

const PUBLIC_PATHS = [
  /^\/$/,
  /^\/login/,
  /^\/api\/auth/,
  /^\/_next\//,
  /^\/favicon\.ico/,
  /^\/manifest\.webmanifest/
];

const RBAC_MATRIX: Array<{ pattern: RegExp; roles: UserRole[] }> = [
  { pattern: /^\/api\/occurrences/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO, USER_ROLE.PROFESSOR] },
  { pattern: /^\/api\/interventions/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO] },
  { pattern: /^\/api\/documents/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO] },
  { pattern: /^\/api\/templates/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR] },
  { pattern: /^\/api\/upload/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO, USER_ROLE.PROFESSOR] },
  { pattern: /^\/api\/import/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.PEDAGOGO] },
  { pattern: /^\/api\/riskrules/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.PEDAGOGO] },
  { pattern: /^\/dashboard/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO, USER_ROLE.PROFESSOR] },
  { pattern: /^\/occurrences/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO, USER_ROLE.PROFESSOR] },
  { pattern: /^\/interventions/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO] },
  { pattern: /^\/documents/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO] },
  { pattern: /^\/analysis/, roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.PEDAGOGO] }
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((regex) => regex.test(pathname))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as UserRole;
  const matched = RBAC_MATRIX.find((entry) => entry.pattern.test(pathname));

  if (matched && !matched.roles.includes(role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  if (!token.schoolId && !pathname.startsWith("/login")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
};
