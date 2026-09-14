import type { ReactNode } from "react";
import { ToastProvider } from "@/components/feedback/Toast";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
