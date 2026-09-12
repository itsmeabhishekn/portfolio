import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}
