export const CANONICAL_ORIGIN = "https://abhishekn.dev";

const LOCAL_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
]);

export function canonicalHref(href: string): string | null {
  const url = new URL(href);
  const onWww = url.hostname === "www.abhishekn.dev";
  const onApexHttp =
    url.hostname === "abhishekn.dev" && url.protocol === "http:";
  if (!onWww && !onApexHttp) {
    return null;
  }
  url.protocol = "https:";
  url.hostname = "abhishekn.dev";
  url.port = "";
  return url.toString();
}

export function redirectToCanonicalHost(): boolean {
  const next = canonicalHref(window.location.href);
  if (next === null) {
    return false;
  }
  window.location.replace(next);
  return true;
}

export function isGoogleSignInOrigin(origin = window.location.origin): boolean {
  return origin === CANONICAL_ORIGIN || LOCAL_ORIGINS.has(origin);
}
