import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AuthContext,
  type AuthStatus,
} from "@/app/providers/auth-context";
import { api } from "@/services/api";
import { getSessionToken, onSessionChange } from "@/services/api/session";
import type { User } from "@/types/domain";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getSessionToken() === null ? "anonymous" : "loading",
  );
  const [user, setUser] = useState<User | null>(null);

  // A stored token proves nothing on its own; the API decides whether it is still
  // good, and the guard needs that answer before it can route anywhere.
  useEffect(() => {
    if (getSessionToken() === null) {
      return;
    }

    let active = true;
    api.auth
      .getCurrentUser()
      .then((loaded) => {
        if (active) {
          setUser(loaded);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setStatus("anonymous");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () =>
      onSessionChange((token) => {
        if (token === null) {
          setUser(null);
          setStatus("anonymous");
        }
      }),
    [],
  );

  const signIn = useCallback(async (credential: string) => {
    const signedIn = await api.auth.signInWithGoogle(credential);
    setUser(signedIn);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(() => {
    api.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut }),
    [signIn, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
