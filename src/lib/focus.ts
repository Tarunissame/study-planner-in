import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uid, unwrap } from "@/lib/data";
import { startOfWeek, todayISO } from "@/lib/study";

export type StudySession = {
  id: string;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  kind: string;
  date: string;
  duration_seconds: number;
  label: string | null;
  created_at: string;
};

export function useStudySessions() {
  return useQuery({
    queryKey: ["study-sessions"],
    queryFn: async (): Promise<StudySession[]> => {
      const res = await supabase.from("study_sessions").select("*").order("created_at", { ascending: false });
      return unwrap<StudySession[]>(res as never);
    },
  });
}

export function useSaveStudySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      subject_id: string | null;
      chapter_id?: string | null;
      topic_id?: string | null;
      kind: string;
      duration_seconds: number;
      label?: string | null;
    }) => {
      const user_id = await uid();
      const { error } = await supabase.from("study_sessions").insert({
        user_id,
        subject_id: v.subject_id,
        chapter_id: v.chapter_id ?? null,
        topic_id: v.topic_id ?? null,
        kind: v.kind,
        date: todayISO(),
        duration_seconds: Math.round(v.duration_seconds),
        label: v.label ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study-sessions"] }),
  });
}

export function useDeleteStudySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study-sessions"] }),
  });
}

/* ---------------- helpers ---------------- */

export const sumSeconds = (sessions: StudySession[], pred: (s: StudySession) => boolean) =>
  sessions.filter(pred).reduce((a, s) => a + s.duration_seconds, 0);

export const secondsToday = (sessions: StudySession[]) => sumSeconds(sessions, (s) => s.date === todayISO());

export const secondsThisWeek = (sessions: StudySession[]) => {
  const start = startOfWeek(todayISO());
  return sumSeconds(sessions, (s) => s.date >= start);
};

export const secondsThisMonth = (sessions: StudySession[]) => {
  const prefix = todayISO().slice(0, 7);
  return sumSeconds(sessions, (s) => s.date.startsWith(prefix));
};

export function bySubjectSeconds(sessions: StudySession[], pred: (s: StudySession) => boolean) {
  const map = new Map<string, number>();
  for (const s of sessions) {
    if (!pred(s) || !s.subject_id) continue;
    map.set(s.subject_id, (map.get(s.subject_id) ?? 0) + s.duration_seconds);
  }
  return map;
}

/** "05h 42m" / "42m" / "50s" */
export function fmtDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

/** "HH:MM:SS" stopwatch clock */
export function fmtClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Ticking clock for live timers. Returns epoch ms, updated every `step` ms while `active`. */
import { useEffect, useState } from "react";
export function useNow(active: boolean, step = 500) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), step);
    return () => clearInterval(t);
  }, [active, step]);
  return now;
}
