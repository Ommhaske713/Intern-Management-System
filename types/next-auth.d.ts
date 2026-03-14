import { DefaultSession } from "next-auth";
import { UserRole } from "@/models/user.model";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      companyId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    companyId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    companyId: string;
  }
}