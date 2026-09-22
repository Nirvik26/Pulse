import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "pulse-super-secret-key-better-auth-2026-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
});

// Legacy backward-compatibility exports so existing API routes continue running without refactoring
export const authOptions = {};

export async function getServerSession(_options?: any) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return null;

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      expires: session.session.expiresAt.toISOString(),
    };
  } catch (error) {
    return null;
  }
}
