import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { REVISION_OFFSETS, todayISO, addDays, type TopicStatus, type TaskType } from "@/lib/study";

export type Profile = {
  user_id: string;
  name: string;
  class: string | null;
  board: string | null;
  stream: string | null;
  exam: string | null;
  default_lecture_target: number;
  default_question_blocks: number;
  default_questions_per_block: number;
  onboarded: boolean;
};

export type Subject = { id: string; name: string; position: number; archived: boolean };
export type Chapter = { id: string; subject_id: string; name: string; position: number; archived: boolean };
export type Topic = {
  id: string;
  subject_id: string;
  chapter_id: string | null;
  name: string;
  status: TopicStatus;
  completed_at: string | null;
  position: number;
  archived: boolean;
};
export type DailyTask = {
  id: string;
  date: string;
  task_type: TaskType;
  label: string;
  target_quantity: number;
  status: TopicStatus;
  completed_quantity: number;
  position: number;
};
export type RevisionItem = {
  id: string;
  topic_id: string;
  revision_number: number;
  due_date: string;
  status: "pending" | "completed" | "skipped";
  completed_at: string | null;
};
export type TrackerColumn = { id: string; name: string; type: string; target: number | null; unit: string | null };
export type TrackerScope = {
  id: string;
  tracker_column_id: string;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
};

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return (data ?? []) as T;
}

/* ---------------- profile ---------------- */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const id = await uid();
      const res = await supabase.from("profiles").select("*").eq("user_id", id).maybeSingle();
      if (res.error) throw res.error;
      if (res.data) return res.data as Profile;
      const created = await supabase.from("profiles").insert({ user_id: id }).select("*").single();
      if (created.error) throw created.error;
      return created.data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const id = await uid();
      const { error } = await supabase.from("profiles").update(patch).eq("user_id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/* ---------------- syllabus ---------------- */

export type Syllabus = { subjects: Subject[]; chapters: Chapter[]; topics: Topic[] };

export function useSyllabus() {
  return useQuery({
    queryKey: ["syllabus"],
    queryFn: async (): Promise<Syllabus> => {
      const [s, c, t] = await Promise.all([
        supabase.from("subjects").select("*").eq("archived", false).order("position"),
        supabase.from("chapters").select("*").eq("archived", false).order("position"),
        supabase.from("topics").select("*").eq("archived", false).order("position"),
      ]);
      return {
        subjects: unwrap<Subject[]>(s as never),
        chapters: unwrap<Chapter[]>(c as never),
        topics: unwrap<Topic[]>(t as never),
      };
    },
  });
}

export function useSyllabusMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["syllabus"] });
    qc.invalidateQueries({ queryKey: ["revisions"] });
  };

  const addSubject = useMutation({
    mutationFn: async ({ name, position }: { name: string; position: number }) => {
      const user_id = await uid();
      const { error } = await supabase.from("subjects").insert({ user_id, name, position });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addChapter = useMutation({
    mutationFn: async (v: { name: string; subject_id: string; position: number }) => {
      const user_id = await uid();
      const { error } = await supabase.from("chapters").insert({ user_id, ...v });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addTopic = useMutation({
    mutationFn: async (v: { name: string; subject_id: string; chapter_id: string | null; position: number }) => {
      const user_id = await uid();
      const { error } = await supabase.from("topics").insert({ user_id, ...v });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const rename = useMutation({
    mutationFn: async ({ table, id, name }: { table: "subjects" | "chapters" | "topics"; id: string; name: string }) => {
      const { error } = await supabase.from(table).update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async ({ table, id }: { table: "subjects" | "chapters" | "topics"; id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: async ({
      table,
      items,
    }: {
      table: "subjects" | "chapters" | "topics";
      items: { id: string; position: number }[];
    }) => {
      for (const it of items) {
        const { error } = await supabase.from(table).update({ position: it.position }).eq("id", it.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  return { addSubject, addChapter, addTopic, rename, remove, reorder };
}

/** Marks a topic status and keeps its spaced-revision schedule in sync. */
export async function applyTopicStatus(topicId: string, status: TopicStatus) {
  const user_id = await uid();
  const completed_at = status === "completed" ? new Date().toISOString() : null;
  const { error } = await supabase.from("topics").update({ status, completed_at }).eq("id", topicId);
  if (error) throw error;

  if (status === "completed") {
    const base = todayISO();
    const rows = REVISION_OFFSETS.map((offset, i) => ({
      user_id,
      topic_id: topicId,
      revision_number: i + 1,
      due_date: addDays(base, offset),
      status: "pending" as const,
    }));
    const { error: rErr } = await supabase
      .from("revision_items")
      .upsert(rows, { onConflict: "topic_id,revision_number", ignoreDuplicates: true });
    if (rErr) throw rErr;
  } else {
    const { error: dErr } = await supabase
      .from("revision_items")
      .delete()
      .eq("topic_id", topicId)
      .eq("status", "pending");
    if (dErr) throw dErr;
  }
}

export function useSetTopicStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TopicStatus }) => applyTopicStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["syllabus"] });
      const prev = qc.getQueryData<Syllabus>(["syllabus"]);
      if (prev) {
        qc.setQueryData<Syllabus>(["syllabus"], {
          ...prev,
          topics: prev.topics.map((t) => (t.id === id ? { ...t, status } : t)),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["syllabus"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["syllabus"] });
      qc.invalidateQueries({ queryKey: ["revisions"] });
    },
  });
}

/* ---------------- tracker columns ---------------- */

export function useTrackerColumns() {
  return useQuery({
    queryKey: ["tracker-columns"],
    queryFn: async () => {
      const [cols, scopes] = await Promise.all([
        supabase.from("tracker_columns").select("*").order("created_at"),
        supabase.from("tracker_column_scopes").select("*"),
      ]);
      return {
        columns: unwrap<TrackerColumn[]>(cols as never),
        scopes: unwrap<TrackerScope[]>(scopes as never),
      };
    },
  });
}

export function useTrackerColumnMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tracker-columns"] });

  const create = useMutation({
    mutationFn: async (v: {
      name: string;
      type: string;
      target: number | null;
      unit: string | null;
      scopes: { subject_id?: string | null; chapter_id?: string | null; topic_id?: string | null }[];
    }) => {
      const user_id = await uid();
      const { data, error } = await supabase
        .from("tracker_columns")
        .insert({ user_id, name: v.name, type: v.type, target: v.target, unit: v.unit })
        .select("id")
        .single();
      if (error) throw error;
      if (v.scopes.length) {
        const { error: sErr } = await supabase.from("tracker_column_scopes").insert(
          v.scopes.map((s) => ({
            user_id,
            tracker_column_id: data.id,
            subject_id: s.subject_id ?? null,
            chapter_id: s.chapter_id ?? null,
            topic_id: s.topic_id ?? null,
          })),
        );
        if (sErr) throw sErr;
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracker_columns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, remove };
}

/* ---------------- daily 360R ---------------- */

export function useDailyTasks(date: string) {
  return useQuery({
    queryKey: ["daily", date],
    queryFn: async (): Promise<DailyTask[]> => {
      const res = await supabase.from("daily_tasks").select("*").eq("date", date).order("position");
      return unwrap<DailyTask[]>(res as never);
    },
  });
}

export function useAllDailyTasks() {
  return useQuery({
    queryKey: ["daily-all"],
    queryFn: async (): Promise<DailyTask[]> => {
      const res = await supabase.from("daily_tasks").select("*").order("date");
      return unwrap<DailyTask[]>(res as never);
    },
  });
}

export function useDailyMutations(date: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["daily", date] });
    qc.invalidateQueries({ queryKey: ["daily-all"] });
  };

  const seedDay = useMutation({
    mutationFn: async (profile: Profile) => {
      const user_id = await uid();
      type DailyInsert = {
        user_id: string;
        date: string;
        task_type: TaskType;
        label: string;
        target_quantity: number;
        position: number;
      };
      const rows: DailyInsert[] = [];
      let pos = 0;
      for (let i = 0; i < profile.default_lecture_target; i++)
        rows.push({ user_id, date, task_type: "lecture", label: `Lecture ${i + 1}`, target_quantity: 1, position: pos++ });
      for (let i = 0; i < profile.default_question_blocks; i++)
        rows.push({
          user_id,
          date,
          task_type: "question_block",
          label: `Questions ×${profile.default_questions_per_block}`,
          target_quantity: profile.default_questions_per_block,
          position: pos++,
        });
      rows.push({ user_id, date, task_type: "revision", label: "Revision session", target_quantity: 1, position: pos++ });
      const { error } = await supabase.from("daily_tasks").insert(rows);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addTask = useMutation({
    mutationFn: async (v: { label: string; task_type: TaskType; target_quantity: number; position: number }) => {
      const user_id = await uid();
      const { error } = await supabase.from("daily_tasks").insert({ user_id, date, ...v });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status, quantity }: { id: string; status: TopicStatus; quantity: number }) => {
      const { error } = await supabase
        .from("daily_tasks")
        .update({ status, completed_quantity: status === "completed" ? quantity : 0 })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status, quantity }) => {
      await qc.cancelQueries({ queryKey: ["daily", date] });
      const prev = qc.getQueryData<DailyTask[]>(["daily", date]);
      if (prev) {
        qc.setQueryData<DailyTask[]>(
          ["daily", date],
          prev.map((t) =>
            t.id === id ? { ...t, status, completed_quantity: status === "completed" ? quantity : 0 } : t,
          ),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["daily", date], ctx.prev);
    },
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("daily_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { seedDay, addTask, setStatus, remove };
}

/* ---------------- revisions ---------------- */

export function useRevisions() {
  return useQuery({
    queryKey: ["revisions"],
    queryFn: async (): Promise<RevisionItem[]> => {
      const res = await supabase.from("revision_items").select("*").order("due_date");
      return unwrap<RevisionItem[]>(res as never);
    },
  });
}

export function useCompleteRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase
        .from("revision_items")
        .update({
          status: done ? "completed" : "pending",
          completed_at: done ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, done }) => {
      await qc.cancelQueries({ queryKey: ["revisions"] });
      const prev = qc.getQueryData<RevisionItem[]>(["revisions"]);
      if (prev) {
        qc.setQueryData<RevisionItem[]>(
          ["revisions"],
          prev.map((r) => (r.id === id ? { ...r, status: done ? "completed" : "pending" } : r)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["revisions"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["revisions"] }),
  });
}