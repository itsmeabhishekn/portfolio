/** Local calendar day, not UTC — IST midnight is still "today". */
export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(day: string, delta: number): string {
  const [year, month, date] = day.split("-").map(Number);
  const next = new Date(year, month - 1, date + delta);
  return dayKey(next);
}

export function lastSevenDays(today = dayKey()): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
}

export function weekdayLabel(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}
