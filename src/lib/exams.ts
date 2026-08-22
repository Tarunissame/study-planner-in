import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uid, unwrap } from "@/lib/data";
import { todayISO } from "@/lib/study";

export type Exam = { id: string; name: string; exam_date: string; is_primary: boolean };

export function useExams() {
  return useQuery({
    queryKey: ["exams"],
    queryFn: async (): Promise<Exam[]> => {
      const res = await supabase.from("exams").select("*").order("exam_date");
      return unwrap<Exam[]>(res as never);
    },
  });
}

export function useExamMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["exams"] });

  const save = useMutation({
    mutationFn: async (v: { id?: string; name: string; exam_date: string; is_primary: boolean }) => {
      const user_id = await uid();
      if (v.is_primary) {
        const { error: clearErr } = await supabase
          .from("exams")
          .update({ is_primary: false })
          .eq("user_id", user_id)
          .eq("is_primary", true);
        if (clearErr) throw clearErr;
      }
      if (v.id) {
        const { error } = await supabase
          .from("exams")
          .update({ name: v.name, exam_date: v.exam_date, is_primary: v.is_primary })
          .eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("exams")
          .insert({ user_id, name: v.name, exam_date: v.exam_date, is_primary: v.is_primary });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

/** Whole days from today until the exam date (negative = past). */
export function daysUntil(examDate: string) {
  const today = todayISO();
  const a = new Date(today + "T00:00:00").getTime();
  const b = new Date(examDate + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}
