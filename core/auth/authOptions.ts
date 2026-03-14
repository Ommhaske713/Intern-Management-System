import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/core/db/dbConnect";
import User, { UserRole } from "@/models/user.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password!);

        if (!isPasswordMatch) {
          throw new Error("Incorrect password");
        }

        const loginType = credentials.loginType;

        if (loginType === 'USER' && user.role === 'ADMIN') {
           throw new Error("Admins must use the Admin Login Portal.");
        }

        if (loginType === 'ADMIN' && user.role !== 'ADMIN') {
           throw new Error("Access Denied: This portal is for Administrators only.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role, 
          companyId: user.companyId.toString(),
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.companyId = (user as any).companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as UserRole;
        (session.user as any).id = token.id as string;
        (session.user as any).companyId = token.companyId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};