import { useEffect, useRef } from "react";
import { CANONICAL_ORIGIN, isGoogleSignInOrigin } from "@/config/origin";
import {
  googleClientId,
  initializeGoogleIdentity,
} from "@/features/auth/googleIdentity";
import styles from "./auth.module.css";

const MIN_WIDTH = 240;
const MAX_WIDTH = 400;

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}

function buttonWidth(parent: HTMLElement) {
  return Math.min(
    MAX_WIDTH,
    Math.max(MIN_WIDTH, Math.floor(parent.clientWidth) || MIN_WIDTH),
  );
}

export function GoogleSignInButton({
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const host = useRef<HTMLDivElement>(null);
  const clientId = googleClientId();
  const originAllowed = isGoogleSignInOrigin();

  useEffect(() => {
    const parent = host.current;
    if (clientId === null || parent === null || !originAllowed) {
      return;
    }

    let active = true;
    let lastWidth = 0;
    let observer: ResizeObserver | null = null;

    const paint = (
      identity: Awaited<ReturnType<typeof initializeGoogleIdentity>>,
    ) => {
      if (!active) {
        return;
      }
      const width = buttonWidth(parent);
      if (width === lastWidth && parent.childElementCount > 0) {
        return;
      }
      lastWidth = width;
      parent.replaceChildren();
      // Always GIS outline on a forced-light well. Dark color-scheme inverts the
      // iframe; filled_black on this palette reads as a hole in the page.
      identity.renderButton(parent, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width,
      });
    };

    initializeGoogleIdentity(clientId, onCredential)
      .then((identity) => {
        paint(identity);
        if (!active || typeof ResizeObserver === "undefined") {
          return;
        }
        observer = new ResizeObserver(() => {
          void initializeGoogleIdentity(clientId, onCredential).then(paint);
        });
        observer.observe(parent);
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
      observer?.disconnect();
    };
  }, [clientId, onCredential, onError, originAllowed]);

  if (clientId === null) {
    return (
      <p className="t-secondary" role="alert">
        Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID and rebuild.
      </p>
    );
  }

  if (!originAllowed) {
    return (
      <p className="t-secondary" role="alert">
        Google will not sign in from this address. Open{" "}
        <a href={`${CANONICAL_ORIGIN}/squat/login`}>
          {`${CANONICAL_ORIGIN}/squat/login`}
        </a>
        .
      </p>
    );
  }

  return (
    <div className={styles.host} ref={host}>
      <div className={styles.placeholder} aria-hidden="true" />
    </div>
  );
}
