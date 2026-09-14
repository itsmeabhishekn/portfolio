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

export function monthLabel(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function parseDay(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

export function monthStart(today: string): string {
  const date = parseDay(today);
  return dayKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function monthDays(today: string): string[] {
  const date = parseDay(today);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: last }, (_, index) =>
    dayKey(new Date(date.getFullYear(), date.getMonth(), index + 1)),
  );
}

export type MonthWeek = {
  week: 1 | 2 | 3 | 4;
  days: string[];
};

export function monthWeekBands(today: string): MonthWeek[] {
  const days = monthDays(today);
  return (
    [
      { week: 1 as const, days: days.slice(0, 7) },
      { week: 2 as const, days: days.slice(7, 14) },
      { week: 3 as const, days: days.slice(14, 21) },
      { week: 4 as const, days: days.slice(21) },
    ]
  ).filter((band) => band.days.length > 0);
}

export function weekMonday(today: string): string {
  const date = parseDay(today);
  const offset = (date.getDay() + 6) % 7;
  return addDays(today, -offset);
}

export function currentWeekDays(today: string): string[] {
  const start = weekMonday(today);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function elapsedDays(days: string[], today: string): string[] {
  return days.filter((day) => day <= today);
}
