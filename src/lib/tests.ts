import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uid, unwrap } from "@/lib/data";

export type TestRecord = {
  id: string;
  name: string;
  date: string;
  exam_type: string | null;
  duration_minutes: number | null;
  marks_obtained: number | null;
  total_marks: number | null;
  percentile: number | null;
  rank: number | null;
  went_well: string;
  needs_improvement: string;
  notes: string;
  mistakes: string[];
  created_at: string;
};

export type TestSubjectScore = {
  id: string;
  test_id: string;
  subject_name: string;
  subject_id: string | null;
  marks_obtained: number;
  total_marks: number;
};

export type TestWeakTopic = { id: string; test_id: string; name: string; topic_id: string | null };
export type TestWeakChapter = { id: string; test_id: string; name: string; chapter_id: string | null };

export type TestWithDetails = TestRecord & {
  subject_scores: TestSubjectScore[];
  weak_topics: TestWeakTopic[];
  weak_chapters: TestWeakChapter[];
};

export type SaveTestInput = Omit<TestRecord, "id" | "created_at"> & {
  id?: string;
  subject_scores: { subject_name: string; subject_id: string | null; marks_obtained: number; total_marks: number }[];
  weak_topics: { name: string; topic_id: string | null }[];
  weak_chapters: { name: string; chapter_id: string | null }[];
};

export function useTests() {
  return useQuery({
    queryKey: ["tests"],
    queryFn: async (): Promise<TestWithDetails[]> => {
      const [t, s, wt, wc] = await Promise.all([
        supabase.from("tests").select("*").order("date", { ascending: false }),
        supabase.from("test_subject_scores").select("*"),
        supabase.from("test_weak_topics").select("*"),
        supabase.from("test_weak_chapters").select("*"),
      ]);
      const tests = unwrap<TestRecord[]>(t as never);
      const scores = unwrap<TestSubjectScore[]>(s as never);
      const weakTopics = unwrap<TestWeakTopic[]>(wt as never);
      const weakChapters = unwrap<TestWeakChapter[]>(wc as never);
      return tests.map((test) => ({
        ...test,
        subject_scores: scores.filter((r) => r.test_id === test.id),
        weak_topics: weakTopics.filter((r) => r.test_id === test.id),
        weak_chapters: weakChapters.filter((r) => r.test_id === test.id),
      }));
    },
  });
}

export function useSaveTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: SaveTestInput) => {
      const user_id = await uid();
      const row = {
        name: v.name,
        date: v.date,
        exam_type: v.exam_type,
        duration_minutes: v.duration_minutes,
        marks_obtained: v.marks_obtained,
        total_marks: v.total_marks,
        percentile: v.percentile,
        rank: v.rank,
        went_well: v.went_well,
        needs_improvement: v.needs_improvement,
        notes: v.notes,
        mistakes: v.mistakes,
      };
      let testId: string = v.id ?? "";
      if (v.id) {
        const { error } = await supabase.from("tests").update(row).eq("id", v.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("tests").insert({ user_id, ...row }).select("id").single();
        if (error) throw error;
        testId = data.id as string;
      }
      // Replace child rows (scores / weak topics / weak chapters).
      const del = await Promise.all([
        supabase.from("test_subject_scores").delete().eq("test_id", testId),
        supabase.from("test_weak_topics").delete().eq("test_id", testId),
        supabase.from("test_weak_chapters").delete().eq("test_id", testId),
      ]);
      for (const d of del) if (d.error) throw d.error;

      if (v.subject_scores.length) {
        const { error } = await supabase
          .from("test_subject_scores")
          .insert(v.subject_scores.map((s) => ({ user_id, test_id: testId, ...s })));
        if (error) throw error;
      }
      if (v.weak_topics.length) {
        const { error } = await supabase
          .from("test_weak_topics")
          .insert(v.weak_topics.map((t) => ({ user_id, test_id: testId, ...t })));
        if (error) throw error;
      }
      if (v.weak_chapters.length) {
        const { error } = await supabase
          .from("test_weak_chapters")
          .insert(v.weak_chapters.map((c) => ({ user_id, test_id: testId, ...c })));
        if (error) throw error;
      }
      return testId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const del = await Promise.all([
        supabase.from("test_subject_scores").delete().eq("test_id", id),
        supabase.from("test_weak_topics").delete().eq("test_id", id),
        supabase.from("test_weak_chapters").delete().eq("test_id", id),
      ]);
      for (const d of del) if (d.error) throw d.error;
      const { error } = await supabase.from("tests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

/** Percentage score for a test, rounded; null when marks are missing. */
export function testPct(t: Pick<TestRecord, "marks_obtained" | "total_marks">): number | null {
  if (t.marks_obtained == null || !t.total_marks) return null;
  return Math.round((t.marks_obtained / t.total_marks) * 100);
}

/** Weak topic/chapter frequency across tests, sorted by count desc. */
export function weakFrequency(items: { name: string; id: string }[]): { name: string; count: number; ids: string[] }[] {
  const map = new Map<string, { name: string; count: number; ids: string[] }>();
  for (const it of items) {
    const key = it.name.trim().toLowerCase();
    if (!key) continue;
    const entry = map.get(key) ?? { name: it.name.trim(), count: 0, ids: [] };
    entry.count += 1;
    entry.ids.push(it.id);
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}
