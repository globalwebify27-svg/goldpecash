import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // Add an empty array as required by NextAuthConfig
  callbacks: {},
} satisfies NextAuthConfig;
