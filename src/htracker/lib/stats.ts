import { addDays } from "@htracker/lib/dates";
import type { Checkin, Habit } from "@htracker/lib/types";

export const XP_PER_CHECK = 10;
export const XP_PER_LEVEL = 40;

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;

  return {
    level,
    into,
    need: XP_PER_LEVEL,
    pct: Math.min(100, (into / XP_PER_LEVEL) * 100),
  };
}

export function rankForLevel(level: number) {
  if (level >= 20) return "Mythic";
  if (level >= 12) return "Forged";
  if (level >= 8) return "Keeper";
  if (level >= 4) return "Apprentice";
  return "Novice";
}

export function isChecked(
  checkins: Checkin[],
  habitId: string,
  day: string,
) {
  return checkins.some((row) => row.habit_id === habitId && row.day === day);
}

export function dayCompletion(
  habits: Habit[],
  checkins: Checkin[],
  day: string,
) {
  if (habits.length === 0) return 0;
  const done = habits.filter((habit) =>
    isChecked(checkins, habit.id, day),
  ).length;
  return done / habits.length;
}

export function currentStreak(
  habits: Habit[],
  checkins: Checkin[],
  today: string,
) {
  if (habits.length === 0) return 0;

  let day = today;
  let streak = 0;

  if (dayCompletion(habits, checkins, today) < 1) {
    day = addDays(today, -1);
  }

  while (dayCompletion(habits, checkins, day) === 1) {
    streak += 1;
    day = addDays(day, -1);
    if (streak > 366) break;
  }

  return streak;
}

export function habitStreak(
  habitId: string,
  checkins: Checkin[],
  today: string,
) {
  let day = today;
  let streak = 0;

  if (!isChecked(checkins, habitId, today)) {
    day = addDays(today, -1);
  }

  while (isChecked(checkins, habitId, day)) {
    streak += 1;
    day = addDays(day, -1);
    if (streak > 366) break;
  }

  return streak;
}

export function rangeFill(
  habits: Habit[],
  checkins: Checkin[],
  days: string[],
) {
  if (habits.length === 0 || days.length === 0) return 0;
  const possible = habits.length * days.length;
  const done = habits.reduce(
    (sum, habit) =>
      sum +
      days.filter((day) => isChecked(checkins, habit.id, day)).length,
    0,
  );
  return done / possible;
}

export function habitFill(
  habitId: string,
  checkins: Checkin[],
  days: string[],
) {
  if (days.length === 0) return { done: 0, possible: 0, ratio: 0 };
  const done = days.filter((day) => isChecked(checkins, habitId, day)).length;
  return { done, possible: days.length, ratio: done / days.length };
}

export function consistencyBoard(
  habits: Habit[],
  checkins: Checkin[],
  days: string[],
) {
  return habits
    .map((habit) => {
      const fill = habitFill(habit.id, checkins, days);
      return { habit, ...fill };
    })
    .sort((a, b) => b.ratio - a.ratio || b.done - a.done);
}
