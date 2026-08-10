export const REVISION_OFFSETS = [1, 2, 3, 4, 7, 15, 39] as const;

export type TopicStatus = "blank" | "in_progress" | "completed";
export type TaskType = "lecture" | "question_block" | "revision" | "custom";
export type RevisionStatus = "pending" | "completed" | "skipped";

export const nextStatus = (s: TopicStatus): TopicStatus =>
  s === "blank" ? "in_progress" : s === "in_progress" ? "completed" : "blank";

export const statusLabel: Record<TopicStatus, string> = {
  blank: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function toISODate(d: Date) {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const todayISO = () => toISODate(new Date());

export type Progress = { total: number; completed: number; inProgress: number; notStarted: number; pct: number };

export function computeProgress(statuses: TopicStatus[]): Progress {
  const total = statuses.length;
  const completed = statuses.filter((s) => s === "completed").length;
  const inProgress = statuses.filter((s) => s === "in_progress").length;
  return {
    total,
    completed,
    inProgress,
    notStarted: total - completed - inProgress,
    pct: total ? Math.round((completed / total) * 100) : 0,
  };
}

export const CLASSES = ["Class 9", "Class 10", "Class 11", "Class 12", "Dropper", "College"];
export const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Other"];
export const STREAMS = ["PCM", "PCB", "PCMB", "Commerce", "Humanities", "Other"];
export const EXAMS = ["JEE", "NEET", "Boards", "CUET", "Olympiad", "Other"];
