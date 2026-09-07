export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const allowedEmail = (
  process.env.NEXT_PUBLIC_HTRACKER_ALLOWED_EMAIL ?? ""
).trim().toLowerCase();

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const htrackerPath = "/htracker/";
