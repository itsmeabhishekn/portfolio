"use client";

import { Flame, Plus } from "lucide-react";
import type { FormEvent } from "react";
import {
  currentWeekDays,
  elapsedDays,
  monthLabel,
  monthWeekBands,
} from "@htracker/lib/dates";
import {
  consistencyBoard,
  currentStreak,
  habitStreak,
  isChecked,
  levelFromXp,
  rangeFill,
  rankForLevel,
  XP_PER_CHECK,
} from "@htracker/lib/stats";
import type { Checkin, Habit } from "@htracker/lib/types";

type Props = {
  email: string;
  today: string;
  habits: Habit[];
  checkins: Checkin[];
  xp: number;
  draft: string;
  busy: boolean;
  message: string;
  onDraft: (value: string) => void;
  onAdd: (event: FormEvent) => void;
  onToggle: (habitId: string, day: string) => void;
  onSignOut: () => void;
};

function ProgressRing({
  label,
  ratio,
  tone,
}: {
  label: string;
  ratio: number;
  tone: "day" | "week" | "month";
}) {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, ratio));
  const offset = circumference * (1 - clamped);
  const pct = Math.round(clamped * 100);

  return (
    <figure className={`htr-ring htr-ring-${tone}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          className="htr-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="htr-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <figcaption>
        <strong>{pct}%</strong>
        <span>{label}</span>
      </figcaption>
    </figure>
  );
}

export function ForgeDashboard({
  email,
  today,
  habits,
  checkins,
  xp,
  draft,
  busy,
  message,
  onDraft,
  onAdd,
  onToggle,
  onSignOut,
}: Props) {
  const weekDays = currentWeekDays(today);
  const weekElapsed = elapsedDays(weekDays, today);
  const monthBands = monthWeekBands(today);
  const monthElapsed = elapsedDays(
    monthBands.flatMap((band) => band.days),
    today,
  );
  const { level, into, need, pct } = levelFromXp(xp);
  const rank = rankForLevel(level);
  const streak = currentStreak(habits, checkins, today);
  const todayRatio = rangeFill(habits, checkins, [today]);
  const weekRatio = rangeFill(habits, checkins, weekElapsed);
  const monthRatio = rangeFill(habits, checkins, monthElapsed);
  const ranked = consistencyBoard(habits, checkins, weekElapsed);

  return (
    <>
      <header className="htr-top">
        <div>
          <p className="htr-kicker">Habit Logs</p>
          <h1>Daily system</h1>
          <p className="htr-player">{email}</p>
        </div>
        <button className="htr-signout" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </header>

      <section className="htr-hud" aria-label="Run stats">
        <article className="htr-stat htr-stat-level">
          <p className="htr-kicker">Level {level}</p>
          <p className="htr-stat-value">{rank}</p>
          <div className="htr-xp" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="htr-stat-sub">
            {into}/{need} XP
          </p>
        </article>
        <article className="htr-stat">
          <p className="htr-kicker">
            <Flame className="htr-ico" aria-hidden="true" /> Streak
          </p>
          <p className="htr-stat-value">{streak}</p>
          <p className="htr-stat-sub">perfect days in a row</p>
        </article>
      </section>

      <section className="htr-insight">
        <div className="htr-panel htr-rings" aria-label="Progress">
          <ProgressRing label="Daily" ratio={todayRatio} tone="day" />
          <ProgressRing label="Weekly" ratio={weekRatio} tone="week" />
          <ProgressRing label="Monthly" ratio={monthRatio} tone="month" />
        </div>

        <div className="htr-panel">
          <div className="htr-panel-head">
            <h2>Best consistency</h2>
            <p>This week</p>
          </div>
          {ranked.length === 0 ? (
            <p className="htr-empty">Quests you add will rank here.</p>
          ) : (
            <ol className="htr-rank">
              {ranked.map((row, index) => (
                <li key={row.habit.id}>
                  <span className="htr-rank-n">{index + 1}</span>
                  <span className="htr-rank-name">{row.habit.name}</span>
                  <span className="htr-rank-bar" aria-hidden="true">
                    <span style={{ width: `${Math.round(row.ratio * 100)}%` }} />
                  </span>
                  <span className="htr-rank-pct">
                    {Math.round(row.ratio * 100)}%
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="htr-panel">
        <div className="htr-panel-head">
          <h2>Today’s quests</h2>
          <p>+{XP_PER_CHECK} XP each</p>
        </div>

        {habits.length === 0 ? (
          <p className="htr-empty">Add one quest you will actually finish.</p>
        ) : (
          <ul className="htr-quests">
            {habits.map((habit) => {
              const on = isChecked(checkins, habit.id, today);
              const run = habitStreak(habit.id, checkins, today);

              return (
                <li key={habit.id}>
                  <button
                    className={`htr-quest ${on ? "is-on" : ""}`}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggle(habit.id, today)}
                  >
                    <span className="htr-mark" aria-hidden="true">
                      {on ? "✓" : ""}
                    </span>
                    <span className="htr-quest-body">
                      <span className="htr-name">{habit.name}</span>
                      <span className="htr-quest-meta">
                        {run > 0 ? `${run}-day streak` : "Start a streak"}
                      </span>
                    </span>
                    <span className="htr-xp-chip">
                      {on ? "Logged" : `+${XP_PER_CHECK} XP`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <form className="htr-add" onSubmit={onAdd}>
          <Plus className="htr-ico" aria-hidden="true" />
          <input
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder="Name a new quest"
            maxLength={40}
            aria-label="New habit"
          />
          <button className="htr-btn" type="submit" disabled={busy || !draft.trim()}>
            Add
          </button>
        </form>
      </section>

      {habits.length > 0 ? (
        <section className="htr-panel">
          <div className="htr-panel-head">
            <h2>Monthly board</h2>
            <p className="htr-board-hint">{monthLabel(today)}</p>
          </div>
          <div className="htr-board-wrap">
            <table className="htr-board htr-month-board">
              <thead>
                <tr>
                  <th scope="col" className="htr-habit-col">
                    Quest
                  </th>
                  {monthBands.map((band) => (
                    <th
                      key={band.week}
                      scope="col"
                      colSpan={band.days.length}
                      className={`htr-week-head week-${band.week}`}
                    >
                      Week {band.week}
                    </th>
                  ))}
                </tr>
                <tr>
                  <td className="htr-habit-col" />
                  {monthBands.flatMap((band) =>
                    band.days.map((day) => (
                      <th
                        key={day}
                        scope="col"
                        className={`week-${band.week} ${day === today ? "is-today" : ""}`}
                      >
                        {Number(day.slice(-2))}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id}>
                    <th scope="row" className="htr-habit-col">
                      {habit.name}
                    </th>
                    {monthBands.flatMap((band) =>
                      band.days.map((day) => {
                        const on = isChecked(checkins, habit.id, day);
                        const future = day > today;
                        return (
                          <td key={day} className={`week-${band.week}`}>
                            <button
                              className={`htr-cell week-${band.week} ${on ? "is-on" : ""} ${day === today ? "is-today" : ""}`}
                              type="button"
                              disabled={future}
                              aria-label={`${habit.name} ${day}`}
                              onClick={() => onToggle(habit.id, day)}
                            />
                          </td>
                        );
                      }),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {message ? <p className="htr-meta">{message}</p> : null}
    </>
  );
}
