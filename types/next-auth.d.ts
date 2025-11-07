import type { UserRole } from "@/constants/enums";

type SessionMembership = {
  schoolId: string;
  role: UserRole;
  schoolName?: string;
  schoolCode?: string;
  isPrimary?: boolean;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      schoolId: string;
      schoolName?: string;
      schools: SessionMembership[];
    };
  }

  interface User {
    role: UserRole;
    schoolId?: string;
    schoolName?: string;
    schools?: SessionMembership[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole;
    schoolId?: string;
    schoolName?: string;
    schools?: SessionMembership[];
  }
}
