import { apiRequest } from "@/services/api/client";
import { parseAuthSession, parseUser } from "@/services/api/map";
import { setSessionToken } from "@/services/api/session";
import type { User } from "@/types/domain";

export async function signInWithGoogle(credential: string): Promise<User> {
  const session = await apiRequest("/auth/google", {
    method: "POST",
    body: { credential },
    parse: parseAuthSession,
  });
  setSessionToken(session.token);
  return session.user;
}

export function getCurrentUser(): Promise<User> {
  return apiRequest("/auth/me", { parse: parseUser });
}

export function signOut(): void {
  setSessionToken(null);
}
