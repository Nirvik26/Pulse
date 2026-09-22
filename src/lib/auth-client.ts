import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp } = authClient;

export const signOut = async (options?: { callbackUrl?: string }) => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        if (typeof window !== "undefined") {
          window.location.href = options?.callbackUrl || "/";
        }
      },
    },
  });
  if (typeof window !== "undefined") {
    window.location.href = options?.callbackUrl || "/";
  }
};

export function useSession() {
  const session = authClient.useSession();

  return {
    data: session.data
      ? {
          user: session.data.user,
          session: session.data.session,
        }
      : null,
    status: session.isPending
      ? ("loading" as const)
      : session.data
      ? ("authenticated" as const)
      : ("unauthenticated" as const),
    isPending: session.isPending,
    error: session.error,
    update: session.refetch,
  };
}
