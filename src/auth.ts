import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          try {
            // Raw SQL Query instead of Prisma
            const [rows] = await db.query(
              "SELECT u.*, b.name as branchName FROM User u LEFT JOIN Branch b ON u.branchId = b.id WHERE u.email = ?",
              [email]
            );

            const user = (rows as any[])[0];

            if (!user) return null;

            // Check hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                branchId: user.branchId,
                branchName: user.branchName,
              };
            }
          } catch (error) {
            console.error("Database error during auth:", error);
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.branchId = (user as any).branchId;
        token.branchName = (user as any).branchName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).branchId = token.branchId;
        (session.user as any).branchName = token.branchName;
      }
      return session;
    },
  },
});

