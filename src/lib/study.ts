/** StudyTracker spaced-revision ladder. Day 0 is the same-day 5-minute revision. */
export const REVISION_OFFSETS = [0, 1, 2, 4, 7, 15, 30] as const;

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

export function formatLongDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Day offset (0, 1, 2, 4, 7, 15, 30) for a 1-based revision number. */
export const revisionOffset = (n: number) => REVISION_OFFSETS[n - 1] ?? n;

/** Human label for a revision number, e.g. "Revision 1 · Day 0 (5-min)". */
export function revisionLabel(n: number) {
  const offset = revisionOffset(n);
  return offset === 0 ? "Day 0 · 5-min revision" : `Day ${offset}`;
}

export const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

/** Monday-start week containing the given ISO date. */
export function startOfWeek(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toISODate(d);
}

export function weekDates(startISO: string) {
  return Array.from({ length: 7 }, (_, i) => addDays(startISO, i));
}

export function formatShortDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatWeekday(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
}

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
