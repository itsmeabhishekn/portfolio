import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import {
  googleClientId,
  loadGoogleIdentity,
} from "@/features/auth/googleIdentity";
import styles from "./auth.module.css";

const MIN_WIDTH = 240;
const MAX_WIDTH = 400;

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}

export function GoogleSignInButton({
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const host = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();
  const clientId = googleClientId();

  useEffect(() => {
    const parent = host.current;
    if (clientId === null || parent === null) {
      return;
    }

    let active = true;

    loadGoogleIdentity()
      .then((identity) => {
        if (!active) {
          return;
        }
        identity.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential);
            } else {
              onError("Google did not return a sign-in credential.");
            }
          },
        });
        parent.replaceChildren();
        identity.renderButton(parent, {
          theme: resolved === "dark" ? "filled_black" : "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width: Math.min(
            MAX_WIDTH,
            Math.max(MIN_WIDTH, parent.clientWidth || MIN_WIDTH),
          ),
        });
      })
      .catch((error: unknown) => {
        if (active) {
          onError(
            error instanceof Error
              ? error.message
              : "Google sign-in is unavailable right now.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [clientId, onCredential, onError, resolved]);

  if (clientId === null) {
    return (
      <p className="t-secondary" role="alert">
        Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID and rebuild.
      </p>
    );
  }

  return <div className={styles.host} ref={host} />;
}
