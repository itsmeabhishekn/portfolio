import type { ThemePreference } from "@/types/domain";

export type ThemeMode = "light" | "dark";
export type { ThemePreference };

export const THEME_COLORS: Record<ThemeMode, string> = {
  light: "#f3f4f2",
  dark: "#0c0f0d",
};

export function isThemePreference(value: string): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}
