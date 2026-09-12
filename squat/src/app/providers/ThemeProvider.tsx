import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/config/app";
import {
  THEME_COLORS,
  isThemePreference,
  type ThemeMode,
  type ThemePreference,
} from "@/config/theme";
import { ThemeContext } from "@/app/providers/theme-context";

function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEYS.themePreference);
  if (stored && isThemePreference(stored)) {
    return stored;
  }
  return "system";
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  const meta = document.getElementById("theme-color");
  if (meta) {
    meta.setAttribute("content", THEME_COLORS[mode]);
  }
}

function resolvePreference(preference: ThemePreference): ThemeMode {
  return preference === "system" ? getSystemTheme() : preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const pref = readPreference();
    applyTheme(resolvePreference(pref));
    return pref;
  });
  const [resolved, setResolved] = useState<ThemeMode>(() =>
    resolvePreference(readPreference()),
  );

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (preference !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setResolved(getSystemTheme());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    localStorage.setItem(STORAGE_KEYS.themePreference, next);
    setResolved(resolvePreference(next));
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
