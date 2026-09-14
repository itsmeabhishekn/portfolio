import { createContext } from "react";
import type { ThemeMode, ThemePreference } from "@/config/theme";

export interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ThemeMode;
  setPreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
