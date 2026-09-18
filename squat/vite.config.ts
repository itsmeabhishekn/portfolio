import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const REQUIRED = ["VITE_API_BASE_URL", "VITE_GOOGLE_CLIENT_ID"] as const;

export default defineConfig(({ command, mode }) => {
  // Both values are baked into the bundle, so a missing one cannot be fixed after
  // the fact. Failing the build beats shipping an app that cannot sign anybody in.
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const missing = REQUIRED.filter((key) => !env[key]?.trim());
    if (missing.length > 0) {
      throw new Error(
        `Missing build configuration: ${missing.join(", ")}. Set them in squat/.env.production or the build environment.`,
      );
    }
  }

  return {
    base: "/squat/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
        clientPort: 5173,
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
