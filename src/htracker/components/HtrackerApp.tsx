"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { allowedEmail, htrackerPath, isConfigured } from "@htracker/lib/config";
import { dayKey, lastSevenDays, weekdayLabel } from "@htracker/lib/dates";
import { getSupabase } from "@htracker/lib/supabase";
import type { Checkin, Habit } from "@htracker/lib/types";

type Status = "boot" | "setup" | "guest" | "blocked" | "ready" | "error";

export function HtrackerApp() {
  const supabase = useMemo(() => getSupabase(), []);
  const [status, setStatus] = useState<Status>(isConfigured ? "boot" : "setup");
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const today = dayKey();
  const week = useMemo(() => lastSevenDays(today), [today]);

  const load = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      const from = lastSevenDays(today)[0];
      const [{ data: habitRows, error: habitError }, { data: checkinRows, error: checkinError }] =
        await Promise.all([
          supabase
            .from("habits")
            .select("*")
            .eq("user_id", userId)
            .eq("archived", false)
            .order("sort_order", { ascending: true }),
          supabase
            .from("checkins")
            .select("*")
            .eq("user_id", userId)
            .gte("day", from)
            .lte("day", today),
        ]);

      if (habitError || checkinError) {
        setMessage(habitError?.message ?? checkinError?.message ?? "Could not load.");
        setStatus("error");
        return;
      }

      setHabits((habitRows ?? []) as Habit[]);
      setCheckins((checkinRows ?? []) as Checkin[]);
      setStatus("ready");
    },
    [supabase, today],
  );

  useEffect(() => {
    if (!supabase) {
      setStatus("setup");
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      const email = next?.user.email?.toLowerCase() ?? "";
      if (!next) {
        setHabits([]);
        setCheckins([]);
        setStatus("guest");
        return;
      }
      if (allowedEmail && email !== allowedEmail) {
        setStatus("blocked");
        return;
      }
      void load(next.user.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [load, supabase]);

  async function signIn() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${htrackerPath}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setMessage(error.message);
      setStatus("error");
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function addHabit(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !session) return;
    const name = draft.trim();
    if (!name) return;

    setBusy(true);
    const { error } = await supabase.from("habits").insert({
      user_id: session.user.id,
      name,
      sort_order: habits.length,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setDraft("");
    await load(session.user.id);
  }

  async function toggle(habitId: string, day: string) {
    if (!supabase || !session) return;
    const existing = checkins.find(
      (row) => row.habit_id === habitId && row.day === day,
    );

    if (existing) {
      const { error } = await supabase
        .from("checkins")
        .delete()
        .eq("habit_id", habitId)
        .eq("day", day);
      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("checkins").insert({
        habit_id: habitId,
        day,
        user_id: session.user.id,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
    }

    await load(session.user.id);
  }

  const checked = (habitId: string, day: string) =>
    checkins.some((row) => row.habit_id === habitId && row.day === day);

  return (
    <main className="htr-page">
      <header className="htr-header">
        <p className="htr-kicker">Private</p>
        <h1>Today</h1>
        {session?.user.email ? (
          <p className="htr-meta">{session.user.email}</p>
        ) : null}
      </header>

      {status === "boot" ? <p className="htr-meta">Loading…</p> : null}

      {status === "setup" ? (
        <section className="htr-card">
          <h2>Supabase keys are missing</h2>
          <p>
            Copy <code>.env.example</code> to <code>.env.local</code>, paste your
            project URL and anon key, then restart <code>npm run dev</code>.
          </p>
        </section>
      ) : null}

      {status === "guest" ? (
        <section className="htr-card">
          <p>Sign in with the Google account you allowlisted in Supabase.</p>
          <button className="htr-btn" type="button" onClick={() => void signIn()} disabled={busy}>
            Continue with Google
          </button>
        </section>
      ) : null}

      {status === "blocked" ? (
        <section className="htr-card">
          <h2>This account is not allowed</h2>
          <p>
            Signed in as {session?.user.email}. Add that address to{" "}
            <code>htracker_allowlist</code> and{" "}
            <code>NEXT_PUBLIC_HTRACKER_ALLOWED_EMAIL</code>, or switch Google
            accounts.
          </p>
          <button className="htr-btn htr-btn-ghost" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </section>
      ) : null}

      {status === "error" ? (
        <section className="htr-card">
          <h2>Something broke</h2>
          <p>{message || "Check the browser console and your Supabase SQL."}</p>
          <button className="htr-btn htr-btn-ghost" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </section>
      ) : null}

      {status === "ready" ? (
        <>
          {habits.length === 0 ? (
            <p className="htr-meta">Add one habit you will actually do.</p>
          ) : (
            <ul className="htr-list">
              {habits.map((habit) => (
                <li key={habit.id} className="htr-habit">
                  <button
                    className={`htr-check ${checked(habit.id, today) ? "is-on" : ""}`}
                    type="button"
                    aria-pressed={checked(habit.id, today)}
                    onClick={() => void toggle(habit.id, today)}
                  >
                    {checked(habit.id, today) ? "Done" : "Mark"}
                  </button>
                  <div>
                    <p className="htr-name">{habit.name}</p>
                    <ol className="htr-week">
                      {week.map((day) => (
                        <li key={day}>
                          <button
                            className={`htr-dot ${checked(habit.id, day) ? "is-on" : ""}`}
                            type="button"
                            title={day}
                            aria-label={`${habit.name} ${day}`}
                            onClick={() => void toggle(habit.id, day)}
                          >
                            {weekdayLabel(day).slice(0, 1)}
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className="htr-add" onSubmit={(event) => void addHabit(event)}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="New habit"
              maxLength={40}
              aria-label="New habit"
            />
            <button className="htr-btn" type="submit" disabled={busy || !draft.trim()}>
              Add
            </button>
          </form>

          <button className="htr-signout" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </>
      ) : null}

      {message && status === "ready" ? <p className="htr-meta">{message}</p> : null}
    </main>
  );
}
