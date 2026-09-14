import { STORAGE_KEYS } from "@/config/app";

type Listener = (token: string | null) => void;

const listeners = new Set<Listener>();

let token: string | null = localStorage.getItem(STORAGE_KEYS.sessionToken);

export function getSessionToken(): string | null {
  return token;
}

export function setSessionToken(next: string | null): void {
  token = next;
  if (next === null) {
    localStorage.removeItem(STORAGE_KEYS.sessionToken);
  } else {
    localStorage.setItem(STORAGE_KEYS.sessionToken, next);
  }
  for (const listener of listeners) {
    listener(next);
  }
}

// Lets the auth provider react when a rejected request clears the session from
// deep inside the API client.
export function onSessionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
