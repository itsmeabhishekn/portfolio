const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonOptions {
  theme: "outline" | "filled_black";
  size: "large";
  text: "continue_with";
  shape: "pill";
  logo_alignment: "left" | "center";
  width: number;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select: boolean;
    cancel_on_tap_outside: boolean;
    ux_mode?: "popup";
    use_fedcm_for_prompt?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

export type { GoogleAccountsId, GoogleCredentialResponse };

let pending: Promise<GoogleAccountsId> | null = null;

export function googleClientId(): string | null {
  const value = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (pending !== null) {
    return pending;
  }

  const loading = new Promise<GoogleAccountsId>((resolve, reject) => {
    const ready = window.google?.accounts.id;
    if (ready) {
      resolve(ready);
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => {
      const loaded = window.google?.accounts.id;
      if (loaded) {
        resolve(loaded);
      } else {
        reject(new Error("Google sign-in is unavailable right now."));
      }
    };
    script.onerror = () =>
      reject(new Error("Google sign-in could not be reached."));
    document.head.append(script);
  });

  // A failed load must not be cached, otherwise a flaky network permanently
  // disables sign-in for the rest of the session.
  pending = loading.catch((error: unknown) => {
    pending = null;
    throw error;
  });

  return pending;
}

let initializedClientId: string | null = null;
let credentialHandler: ((credential: string) => void) | null = null;

export async function initializeGoogleIdentity(
  clientId: string,
  onCredential: (credential: string) => void,
): Promise<GoogleAccountsId> {
  credentialHandler = onCredential;
  const identity = await loadGoogleIdentity();
  if (initializedClientId === clientId) {
    return identity;
  }
  identity.initialize({
    client_id: clientId,
    auto_select: false,
    cancel_on_tap_outside: true,
    ux_mode: "popup",
    use_fedcm_for_prompt: false,
    callback: (response) => {
      if (response.credential) {
        credentialHandler?.(response.credential);
      }
    },
  });
  initializedClientId = clientId;
  return identity;
}
