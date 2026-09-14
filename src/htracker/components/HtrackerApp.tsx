"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { ForgeDashboard } from "@htracker/components/ForgeDashboard";
import { allowedEmail, htrackerRedirectUrl, isConfigured } from "@htracker/lib/config";
import { addDays, dayKey, monthStart } from "@htracker/lib/dates";
import { XP_PER_CHECK } from "@htracker/lib/stats";
import { getSupabase } from "@htracker/lib/supabase";
import type { Checkin, Habit } from "@htracker/lib/types";

type Status = "boot" | "setup" | "guest" | "blocked" | "ready" | "error";

export function HtrackerApp() {
  const supabase = useMemo(() => getSupabase(), []);
  const [status, setStatus] = useState<Status>(isConfigured ? "boot" : "setup");
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [xp, setXp] = useState(0);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const today = dayKey();

  const load = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      const from = [addDays(today, -41), monthStart(today)].sort()[0];
      const [
        { data: habitRows, error: habitError },
        { data: checkinRows, error: checkinError },
        { count, error: countError },
      ] = await Promise.all([
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
        supabase
          .from("checkins")
          .select("habit_id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);

      if (habitError || checkinError || countError) {
        setMessage(
          habitError?.message ??
            checkinError?.message ??
            countError?.message ??
            "Could not load.",
        );
        setStatus("error");
        return;
      }

      setHabits((habitRows ?? []) as Habit[]);
      setCheckins(
        ((checkinRows ?? []) as Checkin[]).map((row) => ({
          ...row,
          day: String(row.day).slice(0, 10),
        })),
      );
      setXp((count ?? 0) * XP_PER_CHECK);
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
        setXp(0);
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
        redirectTo: htrackerRedirectUrl(),
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

  return (
    <main className="htr-page">
      {status === "boot" ? <p className="htr-meta">Loading the board…</p> : null}

      {status === "setup" ? (
        <section className="htr-gate">
          <p className="htr-kicker">Habit Logs</p>
          <h1>Supabase keys are missing</h1>
          <p>
            Copy <code>.env.example</code> to <code>.env.local</code>, paste your
            project URL and anon key, then restart <code>npm run dev</code>.
          </p>
        </section>
      ) : null}

      {status === "guest" ? (
        <section className="htr-gate">
          <p className="htr-kicker">Habit Logsa</p>
          <h1>Continue your run</h1>
          <p>Sign in with the Google account on the allowlist.</p>
          <button className="htr-btn" type="button" onClick={() => void signIn()} disabled={busy}>
            Continue with Google
          </button>
        </section>
      ) : null}

      {status === "blocked" ? (
        <section className="htr-gate">
          <p className="htr-kicker">Locked</p>
          <h1>This account is not allowed</h1>
          <p>
            Signed in as {session?.user.email}. Add that address to the allowlist,
            or switch Google accounts.
          </p>
          <button className="htr-btn htr-btn-ghost" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </section>
      ) : null}

      {status === "error" ? (
        <section className="htr-gate">
          <p className="htr-kicker">Error</p>
          <h1>The board failed to load</h1>
          <p>{message || "Check the browser console and your Supabase SQL."}</p>
          <button className="htr-btn htr-btn-ghost" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </section>
      ) : null}

      {status === "ready" && session?.user.email ? (
        <ForgeDashboard
          email={session.user.email}
          today={today}
          habits={habits}
          checkins={checkins}
          xp={xp}
          draft={draft}
          busy={busy}
          message={message}
          onDraft={setDraft}
          onAdd={(event) => void addHabit(event)}
          onToggle={(habitId, day) => void toggle(habitId, day)}
          onSignOut={() => void signOut()}
        />
      ) : null}
    </main>
  );
}
