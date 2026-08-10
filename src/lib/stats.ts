import type { DailyTask } from "@/lib/data";
import { addDays, todayISO } from "@/lib/study";

export type DayScore = { date: string; total: number; completed: number; ratio: number };

export function scoreDays(tasks: DailyTask[]): Map<string, DayScore> {
  const map = new Map<string, DayScore>();
  for (const t of tasks) {
    const entry = map.get(t.date) ?? { date: t.date, total: 0, completed: 0, ratio: 0 };
    entry.total += 1;
    if (t.status === "completed") entry.completed += 1;
    entry.ratio = entry.total ? entry.completed / entry.total : 0;
    map.set(t.date, entry);
  }
  return map;
}

export function dayColor(score?: DayScore) {
  if (!score || score.total === 0) return "none";
  if (score.ratio >= 0.8) return "strong";
  if (score.ratio >= 0.4) return "partial";
  return "poor";
}

/** A day counts toward a streak when at least half of its tasks were completed. */
export function computeStreak(tasks: DailyTask[]) {
  const scores = scoreDays(tasks);
  const good = (d: string) => {
    const s = scores.get(d);
    return !!s && s.total > 0 && s.ratio >= 0.5;
  };

  let current = 0;
  let cursor = todayISO();
  if (!good(cursor)) cursor = addDays(cursor, -1);
  while (good(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  const days = [...scores.keys()].filter(good).sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }

  return { current, longest: Math.max(longest, current) };
}