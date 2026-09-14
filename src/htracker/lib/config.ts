export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const allowedEmail = (
  process.env.NEXT_PUBLIC_HTRACKER_ALLOWED_EMAIL ?? ""
).trim().toLowerCase();

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const htrackerPath = "/htracker/";

export function htrackerRedirectUrl() {
  // Must match the origin that stores the session (www vs apex).
  if (typeof window !== "undefined") {
    return `${window.location.origin}${htrackerPath}`;
  }

  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (fromEnv) {
    return `${fromEnv}${htrackerPath}`;
  }

  return htrackerPath;
}
