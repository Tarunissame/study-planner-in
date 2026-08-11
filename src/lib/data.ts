import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { REVISION_OFFSETS, todayISO, addDays, type TopicStatus, type TaskType } from "@/lib/study";
import {
  DEFAULT_TRACKING_RESOURCES,
  subjectsForStream,
  templateFor,
} from "@/lib/syllabus-templates";

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
export type Chapter = {
  id: string;
  subject_id: string;
  name: string;
  position: number;
  archived: boolean;
  status: TopicStatus;
};
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
  block_index: number;
  r360_item_id: string | null;
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
export type DailyNote = { id: string; date: string; content: string };
export type StudyLog = {
  id: string;
  date: string;
  lecture_number: number;
  lecture_name: string | null;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  topic_name: string;
};
export type R360Item = {
  id: string;
  kind: "lecture" | "question" | "revision" | "custom";
  label: string;
  block_count: number;
  per_block: number;
  unit: string | null;
  position: number;
};
export type TrackingResource = { id: string; name: string; position: number };
export type TrackingCell = { id: string; chapter_id: string; resource_id: string; status: TopicStatus };

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
    qc.invalidateQueries({ queryKey: ["daily-range"] });
  };

  const seedDay = useMutation({
    mutationFn: async (items: R360Item[]) => {
      const user_id = await uid();
      type DailyInsert = {
        user_id: string;
        date: string;
        task_type: TaskType;
        label: string;
        target_quantity: number;
        position: number;
        block_index: number;
        r360_item_id: string;
      };
      const rows: DailyInsert[] = [];
      let pos = 0;
      for (const item of items) {
        const type: TaskType =
          item.kind === "lecture"
            ? "lecture"
            : item.kind === "question"
              ? "question_block"
              : item.kind === "revision"
                ? "revision"
                : "custom";
        for (let i = 0; i < Math.max(1, item.block_count); i++) {
          rows.push({
            user_id,
            date,
            task_type: type,
            label: item.block_count > 1 ? `${item.label} ${i + 1}` : item.label,
            target_quantity: Math.max(1, item.per_block),
            position: pos++,
            block_index: i,
            r360_item_id: item.id,
          });
        }
      }
      if (!rows.length) return;
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

export function useSkipRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("revision_items").update({ status: "skipped" }).eq("id", id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["revisions"] }),
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
/* ---------------- chapter status ---------------- */

export function useSetChapterStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TopicStatus }) => {
      const { error } = await supabase.from("chapters").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["syllabus"] });
      const prev = qc.getQueryData<Syllabus>(["syllabus"]);
      if (prev) {
        qc.setQueryData<Syllabus>(["syllabus"], {
          ...prev,
          chapters: prev.chapters.map((c) => (c.id === id ? { ...c, status } : c)),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["syllabus"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["syllabus"] }),
  });
}

/* ---------------- syllabus templates / provisioning ---------------- */

/** Creates a subject and, when a template exists, its chapters and topics. */
export async function createSubjectFromTemplate(name: string, position: number) {
  const user_id = await uid();
  const tpl = templateFor(name);
  const subjectName = tpl?.name ?? name;

  const existing = await supabase.from("subjects").select("id").eq("name", subjectName).maybeSingle();
  if (existing.data) return existing.data.id as string;

  const { data: subject, error } = await supabase
    .from("subjects")
    .insert({ user_id, name: subjectName, position })
    .select("id")
    .single();
  if (error) throw error;

  if (tpl) {
    const { data: chapters, error: cErr } = await supabase
      .from("chapters")
      .insert(
        tpl.chapters.map((c, i) => ({ user_id, subject_id: subject.id, name: c.name, position: i })),
      )
      .select("id, name, position");
    if (cErr) throw cErr;

    const topics = (chapters ?? []).flatMap((ch) => {
      const source = tpl.chapters[ch.position];
      return (source?.topics ?? []).map((t, i) => ({
        user_id,
        subject_id: subject.id,
        chapter_id: ch.id,
        name: t,
        position: i,
      }));
    });
    if (topics.length) {
      const { error: tErr } = await supabase.from("topics").insert(topics);
      if (tErr) throw tErr;
    }
  }
  return subject.id as string;
}

export function useAddSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, position }: { name: string; position: number }) =>
      createSubjectFromTemplate(name, position),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["syllabus"] });
      qc.invalidateQueries({ queryKey: ["tracking"] });
    },
  });
}

/** Creates the default subjects + syllabus for the student's stream. */
export function useProvisionStream() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stream: string | null) => {
      const names = subjectsForStream(stream);
      let created = 0;
      for (const [i, name] of names.entries()) {
        const before = await supabase.from("subjects").select("id").eq("name", name).maybeSingle();
        if (before.data) continue;
        await createSubjectFromTemplate(name, i);
        created++;
      }
      await ensureTrackingResources();
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["syllabus"] });
      qc.invalidateQueries({ queryKey: ["tracking"] });
    },
  });
}

/* ---------------- daily notes ---------------- */

export function useDailyNote(date: string) {
  return useQuery({
    queryKey: ["note", date],
    queryFn: async (): Promise<DailyNote | null> => {
      const { data, error } = await supabase.from("daily_notes").select("*").eq("date", date).maybeSingle();
      if (error) throw error;
      return (data as DailyNote) ?? null;
    },
  });
}

export function useRecentNotes(limit = 14) {
  return useQuery({
    queryKey: ["notes", limit],
    queryFn: async (): Promise<DailyNote[]> => {
      const res = await supabase.from("daily_notes").select("*").order("date", { ascending: false }).limit(limit);
      return unwrap<DailyNote[]>(res as never);
    },
  });
}

export function useNoteMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["note"] });
    qc.invalidateQueries({ queryKey: ["notes"] });
  };
  const save = useMutation({
    mutationFn: async ({ date, content }: { date: string; content: string }) => {
      const user_id = await uid();
      const { error } = await supabase
        .from("daily_notes")
        .upsert({ user_id, date, content }, { onConflict: "user_id,date" });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("daily_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { save, remove };
}

/* ---------------- study log (topics studied) ---------------- */

export function useStudyLogs(date?: string) {
  return useQuery({
    queryKey: ["study-logs", date ?? "all"],
    queryFn: async (): Promise<StudyLog[]> => {
      let q = supabase.from("study_logs").select("*").order("lecture_number");
      if (date) q = q.eq("date", date);
      const res = await q;
      return unwrap<StudyLog[]>(res as never);
    },
  });
}

/** Schedules the full revision ladder (days 0,1,2,4,7,15,30) for a topic. */
export async function scheduleRevisions(topicId: string, baseDate: string) {
  const user_id = await uid();
  const rows = REVISION_OFFSETS.map((offset, i) => ({
    user_id,
    topic_id: topicId,
    revision_number: i + 1,
    due_date: addDays(baseDate, offset),
    status: "pending" as const,
  }));
  const { error } = await supabase
    .from("revision_items")
    .upsert(rows, { onConflict: "topic_id,revision_number", ignoreDuplicates: true });
  if (error) throw error;
}

export function useStudyLogMutations(date: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["study-logs"] });
    qc.invalidateQueries({ queryKey: ["revisions"] });
    qc.invalidateQueries({ queryKey: ["syllabus"] });
  };

  const add = useMutation({
    mutationFn: async (v: {
      lecture_number: number;
      lecture_name?: string | null;
      subject_id: string | null;
      chapter_id: string | null;
      topic_id: string | null;
      topic_name: string;
    }) => {
      const user_id = await uid();
      const { error } = await supabase.from("study_logs").insert({
        user_id,
        date,
        lecture_number: v.lecture_number,
        lecture_name: v.lecture_name ?? null,
        subject_id: v.subject_id,
        chapter_id: v.chapter_id,
        topic_id: v.topic_id,
        topic_name: v.topic_name,
      });
      if (error) throw error;
      if (v.topic_id) await scheduleRevisions(v.topic_id, date);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { add, remove };
}

/* ---------------- 360R configuration ---------------- */

export const DEFAULT_R360: Omit<R360Item, "id">[] = [
  { kind: "lecture", label: "Lecture", block_count: 3, per_block: 1, unit: null, position: 0 },
  { kind: "question", label: "Question Practice", block_count: 6, per_block: 10, unit: "questions", position: 1 },
  { kind: "revision", label: "Revision (Today · 5 mins)", block_count: 1, per_block: 1, unit: null, position: 2 },
  { kind: "revision", label: "Revision (Previous)", block_count: 1, per_block: 1, unit: null, position: 3 },
];

async function ensureR360Items(): Promise<R360Item[]> {
  const user_id = await uid();
  const res = await supabase.from("r360_items").select("*").order("position");
  if (res.error) throw res.error;
  if ((res.data ?? []).length) return res.data as R360Item[];
  const { data, error } = await supabase
    .from("r360_items")
    .insert(DEFAULT_R360.map((d) => ({ user_id, ...d })))
    .select("*");
  if (error) throw error;
  return (data ?? []) as R360Item[];
}

export function useR360Items() {
  return useQuery({ queryKey: ["r360"], queryFn: ensureR360Items });
}

export function useR360Mutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["r360"] });
    qc.invalidateQueries({ queryKey: ["daily"] });
    qc.invalidateQueries({ queryKey: ["daily-all"] });
  };

  const add = useMutation({
    mutationFn: async (v: Omit<R360Item, "id">) => {
      const user_id = await uid();
      const { error } = await supabase.from("r360_items").insert({ user_id, ...v });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<R360Item> & { id: string }) => {
      const { error } = await supabase.from("r360_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("r360_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

/* ---------------- chapter-wise tracking ---------------- */

export async function ensureTrackingResources(): Promise<TrackingResource[]> {
  const user_id = await uid();
  const res = await supabase.from("tracking_resources").select("*").order("position");
  if (res.error) throw res.error;
  if ((res.data ?? []).length) return res.data as TrackingResource[];
  const { data, error } = await supabase
    .from("tracking_resources")
    .insert(DEFAULT_TRACKING_RESOURCES.map((name, position) => ({ user_id, name, position })))
    .select("*");
  if (error) throw error;
  return (data ?? []) as TrackingResource[];
}

export function useTracking() {
  return useQuery({
    queryKey: ["tracking"],
    queryFn: async () => {
      const resources = await ensureTrackingResources();
      const cells = await supabase.from("tracking_cells").select("*");
      return { resources, cells: unwrap<TrackingCell[]>(cells as never) };
    },
  });
}

export function useTrackingMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tracking"] });

  const setCell = useMutation({
    mutationFn: async (v: { chapter_id: string; resource_id: string; status: TopicStatus }) => {
      const user_id = await uid();
      const { error } = await supabase
        .from("tracking_cells")
        .upsert({ user_id, ...v }, { onConflict: "chapter_id,resource_id" });
      if (error) throw error;
    },
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["tracking"] });
      const prev = qc.getQueryData<{ resources: TrackingResource[]; cells: TrackingCell[] }>(["tracking"]);
      if (prev) {
        const idx = prev.cells.findIndex((c) => c.chapter_id === v.chapter_id && c.resource_id === v.resource_id);
        const cells =
          idx >= 0
            ? prev.cells.map((c, i) => (i === idx ? { ...c, status: v.status } : c))
            : [...prev.cells, { id: `tmp-${v.chapter_id}-${v.resource_id}`, ...v }];
        qc.setQueryData(["tracking"], { ...prev, cells });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tracking"], ctx.prev);
    },
    onSettled: invalidate,
  });

  const addResource = useMutation({
    mutationFn: async ({ name, position }: { name: string; position: number }) => {
      const user_id = await uid();
      const { error } = await supabase.from("tracking_resources").insert({ user_id, name, position });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracking_resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { setCell, addResource, removeResource };
}

/** Daily tasks for a date range (weekly 360R table). */
export function useTasksInRange(from: string, to: string) {
  return useQuery({
    queryKey: ["daily-range", from, to],
    queryFn: async (): Promise<DailyTask[]> => {
      const res = await supabase
        .from("daily_tasks")
        .select("*")
        .gte("date", from)
        .lte("date", to)
        .order("position");
      return unwrap<DailyTask[]>(res as never);
    },
  });
}

/** Study logs for a date range. */
export function useStudyLogsInRange(from: string, to: string) {
  return useQuery({
    queryKey: ["study-logs-range", from, to],
    queryFn: async (): Promise<StudyLog[]> => {
      const res = await supabase
        .from("study_logs")
        .select("*")
        .gte("date", from)
        .lte("date", to)
        .order("lecture_number");
      return unwrap<StudyLog[]>(res as never);
    },
  });
}
