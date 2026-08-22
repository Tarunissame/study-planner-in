import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uid, unwrap } from "@/lib/data";
import { addDays, todayISO } from "@/lib/study";

export type Habit = { id: string; name: string; position: number; archived: boolean };
export type HabitCompletion = { id: string; habit_id: string; date: string };

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const [h, c] = await Promise.all([
        supabase.from("habits").select("*").order("position"),
        supabase.from("habit_completions").select("*"),
      ]);
      return {
        habits: unwrap<Habit[]>(h as never),
        completions: unwrap<HabitCompletion[]>(c as never),
      };
    },
  });
}

export function useHabitMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["habits"] });

  const add = useMutation({
    mutationFn: async ({ name, position }: { name: string; position: number }) => {
      const user_id = await uid();
      const { error } = await supabase.from("habits").insert({ user_id, name, position });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const rename = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("habits").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setArchived = useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase.from("habits").update({ archived }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: async ({ habit_id, date, done }: { habit_id: string; date: string; done: boolean }) => {
      const user_id = await uid();
      if (done) {
        const { error } = await supabase
          .from("habit_completions")
          .upsert({ user_id, habit_id, date }, { onConflict: "habit_id,date", ignoreDuplicates: true });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("habit_completions").delete().eq("habit_id", habit_id).eq("date", date);
        if (error) throw error;
      }
    },
    onMutate: async ({ habit_id, date, done }) => {
      await qc.cancelQueries({ queryKey: ["habits"] });
      const prev = qc.getQueryData<{ habits: Habit[]; completions: HabitCompletion[] }>(["habits"]);
      if (prev) {
        const completions = done
          ? [...prev.completions, { id: `tmp-${habit_id}-${date}`, habit_id, date }]
          : prev.completions.filter((c) => !(c.habit_id === habit_id && c.date === date));
        qc.setQueryData(["habits"], { ...prev, completions });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["habits"], ctx.prev);
    },
    onSettled: invalidate,
  });

  return { add, rename, setArchived, remove, toggle };
}

export type HabitStats = { current: number; longest: number; total: number; pct: number };

/** Streak stats from a set of ISO completion dates. */
export function habitStats(dates: Set<string>): HabitStats {
  const today = todayISO();
  const total = dates.size;
  // current streak: consecutive days ending today (or yesterday if today not done yet)
  let current = 0;
  let cursor = dates.has(today) ? today : addDays(today, -1);
  while (dates.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  // longest streak
  const sorted = [...dates].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  // completion % over the last 30 days
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today, -i));
  const done30 = last30.filter((d) => dates.has(d)).length;
  return { current, longest, total, pct: Math.round((done30 / 30) * 100) };
}
