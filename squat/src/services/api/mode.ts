export function isMockApi(): boolean {
  if (import.meta.env.VITE_USE_MOCK_API === "true") {
    return true;
  }
  const base = import.meta.env.VITE_API_BASE_URL;
  return typeof base !== "string" || base.trim().length === 0;
}
