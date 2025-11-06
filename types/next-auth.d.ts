import type { UserRole } from "@/constants/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      schoolId: string;
      schools: Array<{ schoolId: string; role: UserRole }>;
    };
  }

  interface User {
    role: UserRole;
    schoolId?: string;
    schools?: Array<{ schoolId: string; role: UserRole }>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole;
    schoolId?: string;
    schools?: Array<{ schoolId: string; role: UserRole }>;
  }
}
