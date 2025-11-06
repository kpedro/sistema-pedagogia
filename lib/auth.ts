import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTION, USER_ROLE, type UserRole } from "@/constants/enums";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  otp: z.string().optional(),
  schoolId: z.string().optional()
});

const ROLE_TOTP_REQUIRED = new Set<UserRole>([USER_ROLE.ADMIN, USER_ROLE.PEDAGOGO]);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Login corporativo",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        otp: { label: "Codigo 2FA", type: "text" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Credenciais invalidas");
        }

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              include: { school: true },
              orderBy: { createdAt: "asc" }
            }
          }
        });

        if (!user || !user.isActive) {
          throw new Error("Usuario invalido");
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          throw new Error("Usuario ou senha incorretos");
        }

        const membership =
          parsed.data.schoolId
            ? user.memberships.find((m) => m.schoolId === parsed.data.schoolId)
            : user.memberships.find((m) => m.isPrimary) ?? user.memberships[0];

        if (!membership) {
          throw new Error("Usuario sem escola atribuida");
        }

        if (ROLE_TOTP_REQUIRED.has(membership.role as UserRole) || user.totpEnabled) {
          if (!parsed.data.otp || !user.totpSecret) {
            throw new Error("2FA obrigatorio");
          }
          const verified = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: "base32",
            token: parsed.data.otp,
            window: 1
          });
          if (!verified) {
            throw new Error("Codigo 2FA invalido");
          }
        }

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          }),
          prisma.auditLog.create({
            data: {
              schoolId: membership.schoolId,
              action: AUDIT_ACTION.LOGIN,
              actorId: user.id,
              target: membership.schoolId,
              summary: `Sessao iniciada (${membership.role})`,
              payload: JSON.stringify({ email })
            }
          })
        ]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: membership.role as UserRole,
          schoolId: membership.schoolId,
          schools: user.memberships.map((m) => ({
            schoolId: m.schoolId,
            role: m.role as UserRole
          }))
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.schoolId = (user as any).schoolId;
        token.schools = (user as any).schools ?? [];
      }

      if (trigger === "update" && session?.schoolId) {
        token.schoolId = session.schoolId as string;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as UserRole;
        session.user.schoolId = token.schoolId as string;
        session.user.schools =
          (token.schools as Array<{ schoolId: string; role: UserRole }>) ?? [];
      }
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      if (!token?.schoolId) return;
      await prisma.auditLog.create({
        data: {
          schoolId: token.schoolId,
          action: AUDIT_ACTION.LOGOUT,
          actorId: token.userId,
          target: token.schoolId,
          summary: "Sessao encerrada",
          payload: JSON.stringify({ email: token.email })
        }
      });
    }
  }
};

export const getServerAuthSession = () => getServerSession(authOptions);
