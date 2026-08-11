import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ListChecks, Plus, Trash2, X } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { StatusBox } from "@/components/StatusBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useDailyMutations,
  useDailyTasks,
  useR360Items,
  useStudyLogMutations,
  useStudyLogs,
  useSyllabus,
  useTasksInRange,
  type DailyTask,
  type R360Item,
} from "@/lib/data";
import {
  addDays,
  formatLongDate,
  formatShortDate,
  formatWeekday,
  nextStatus,
  startOfWeek,
  statusLabel,
  todayISO,
  weekDates,
} from "@/lib/study";

export const Route = createFileRoute("/_authenticated/daily")({
  head: () => ({
    meta: [
      { title: "Daily 360R — StudyTracker" },
      { name: "description", content: "Track lectures, topics studied, question blocks and revisions every day." },
      { property: "og:title", content: "Daily 360R — StudyTracker" },
      { property: "og:description", content: "One clean checklist per day plus a weekly progress table." },
    ],
  }),
  component: DailyPage,
});

function useGroupedTasks(tasks: DailyTask[], items: R360Item[]) {
  return useMemo(() => {
    return items.map((item) => ({
      item,
      blocks: tasks
        .filter((t) => t.r360_item_id === item.id)
        .sort((a, b) => a.block_index - b.block_index),
    }));
  }, [tasks, items]);
}

/* ------------------------- topics studied ------------------------- */

function TopicsStudied({ date, lectureCount }: { date: string; lectureCount: number }) {
  const { data: syllabus } = useSyllabus();
  const { data: logs = [] } = useStudyLogs(date);
  const { add, remove } = useStudyLogMutations(date);

  return (
    <div className="card-lofi p-4">
      <h3 className="font-display text-sm font-semibold">Topics studied in each lecture</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Everything you log here is scheduled into your revision ladder automatically (days 0, 1, 2, 4, 7, 15, 30).
      </p>
      <div className="mt-4 space-y-4">
        {Array.from({ length: Math.max(1, lectureCount) }, (_, i) => i + 1).map((n) => (
          <LectureLog
            key={n}
            n={n}
            logs={logs.filter((l) => l.lecture_number === n)}
            syllabus={syllabus}
            onAdd={(v) => add.mutate({ lecture_number: n, ...v })}
            onRemove={(id) => remove.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}

type SyllabusData = ReturnType<typeof useSyllabus>["data"];

function LectureLog({
  n,
  logs,
  syllabus,
  onAdd,
  onRemove,
}: {
  n: number;
  logs: { id: string; topic_name: string; chapter_id: string | null; lecture_name: string | null }[];
  syllabus: SyllabusData;
  onAdd: (v: {
    lecture_name: string | null;
    subject_id: string | null;
    chapter_id: string | null;
    topic_id: string | null;
    topic_name: string;
  }) => void;
  onRemove: (id: string) => void;
}) {
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [custom, setCustom] = useState("");

  const subjects = syllabus?.subjects ?? [];
  const chapters = (syllabus?.chapters ?? []).filter((c) => c.subject_id === subjectId);
  const topics = (syllabus?.topics ?? []).filter((t) =>
    chapterId ? t.chapter_id === chapterId : t.subject_id === subjectId && !t.chapter_id,
  );
  const chapterName = (id: string | null) => syllabus?.chapters.find((c) => c.id === id)?.name;

  function submit() {
    const topic = topics.find((t) => t.id === topicId);
    const name = topic?.name ?? custom.trim();
    if (!name) return;
    onAdd({
      lecture_name: null,
      subject_id: subjectId || null,
      chapter_id: chapterId || null,
      topic_id: topic?.id ?? null,
      topic_name: name.slice(0, 160),
    });
    setTopicId("");
    setCustom("");
  }

  return (
    <div className="rounded-lg border border-border bg-surface-2/40 p-3">
      <p className="text-sm font-medium">Lecture {n}</p>
      {logs.length > 0 && (
        <ul className="mt-2 space-y-1">
          {logs.map((l) => (
            <li key={l.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">→</span>
              <span className="flex-1 truncate">
                {l.topic_name}
                {chapterName(l.chapter_id) && (
                  <span className="ml-2 text-xs opacity-70">{chapterName(l.chapter_id)}</span>
                )}
              </span>
              <button onClick={() => onRemove(l.id)} aria-label="Remove topic" className="text-destructive/80">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Select
          value={subjectId}
          onValueChange={(v) => {
            setSubjectId(v);
            setChapterId("");
            setTopicId("");
          }}
        >
          <SelectTrigger className="h-9"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={chapterId} onValueChange={(v) => { setChapterId(v); setTopicId(""); }} disabled={!subjectId}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Chapter" /></SelectTrigger>
          <SelectContent>
            {chapters.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={topicId} onValueChange={setTopicId} disabled={!subjectId}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Topic" /></SelectTrigger>
          <SelectContent>
            {topics.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input
            className="h-9"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="or type a topic"
          />
          <Button size="sm" variant="secondary" className="h-9" onClick={submit}>
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- weekly table ------------------------- */

function WeeklyTable({ items }: { items: R360Item[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(todayISO()));
  const days = weekDates(weekStart);
  const { data: tasks = [] } = useTasksInRange(days[0]!, days[6]!);

  const lectureItems = items.filter((i) => i.kind === "lecture");
  const questionItems = items.filter((i) => i.kind === "question");
  const otherItems = items.filter((i) => i.kind !== "lecture" && i.kind !== "question");

  const forDay = (d: string) => tasks.filter((t) => t.date === d);
  const doneOf = (d: string, itemId: string, blockIndex?: number) =>
    forDay(d).some(
      (t) =>
        t.r360_item_id === itemId &&
        t.status === "completed" &&
        (blockIndex === undefined || t.block_index === blockIndex),
    );

  const lecturesDone = (d: string) =>
    forDay(d).filter((t) => t.task_type === "lecture" && t.status === "completed").length;
  const questionsDone = (d: string) =>
    forDay(d)
      .filter((t) => t.task_type === "question_block" && t.status === "completed")
      .reduce((sum, t) => sum + (t.completed_quantity || t.target_quantity), 0);

  const maxLectureBlocks = Math.max(0, ...lectureItems.map((i) => i.block_count));
  const questionTarget = questionItems.reduce((s, i) => s + i.block_count * i.per_block, 0);

  const cell = "px-2 py-2 text-center text-xs";

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Weekly 360R</h2>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-44 text-center text-xs font-medium sm:text-sm">
            {formatShortDate(days[0]!)} – {formatShortDate(days[6]!)}
          </span>
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="card-lofi overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">360R</th>
              {days.map((d) => (
                <th key={d} className={`${cell} font-medium ${d === todayISO() ? "text-primary" : "text-muted-foreground"}`}>
                  <div>{formatWeekday(d)}</div>
                  <div className="opacity-70">{formatShortDate(d)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxLectureBlocks }, (_, b) => (
              <tr key={`lec-${b}`} className="border-b border-border/60">
                <td className="px-3 py-2 text-sm">Lecture {b + 1}</td>
                {days.map((d) => (
                  <td key={d} className={cell}>
                    {lectureItems.some((i) => doneOf(d, i.id, b)) ? <span className="text-success">✓</span> : <span className="text-muted-foreground/40">–</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-border bg-surface-2/40">
              <td className="px-3 py-2 text-sm font-medium">Lectures done</td>
              {days.map((d) => (
                <td key={d} className={`${cell} font-medium`}>
                  {lecturesDone(d) ? `${lecturesDone(d)} Lec` : <span className="text-muted-foreground/40">–</span>}
                </td>
              ))}
            </tr>
            <tr className="border-b border-border bg-surface-2/40">
              <td className="px-3 py-2 text-sm font-medium">Questions ({questionTarget})</td>
              {days.map((d) => (
                <td key={d} className={`${cell} font-medium`}>
                  {questionsDone(d) ? `${questionsDone(d)} Q` : <span className="text-muted-foreground/40">–</span>}
                </td>
              ))}
            </tr>
            {otherItems.map((item) => (
              <tr key={item.id} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 text-sm">{item.label}</td>
                {days.map((d) => (
                  <td key={d} className={cell}>
                    {doneOf(d, item.id) ? <span className="text-success">✓</span> : <span className="text-muted-foreground/40">–</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        This table fills itself from your daily checklist — you never have to update it manually.
      </p>
    </section>
  );
}

/* ------------------------- page ------------------------- */

function DailyPage() {
  const [date, setDate] = useState(todayISO());
  const { data: items = [] } = useR360Items();
  const { data: tasks = [], isLoading } = useDailyTasks(date);
  const { addTask, setStatus, remove, seedDay } = useDailyMutations(date);
  const [label, setLabel] = useState("");
  const groups = useGroupedTasks(tasks, items);

  // Auto-load today's checklist from the 360R configuration.
  useEffect(() => {
    if (date === todayISO() && !isLoading && tasks.length === 0 && items.length > 0 && !seedDay.isPending) {
      seedDay.mutate(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, isLoading, tasks.length, items.length]);

  const completed = tasks.filter((t) => t.status === "completed").length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const lectureCount = items.filter((i) => i.kind === "lecture").reduce((s, i) => s + i.block_count, 0);
  const questionsDone = tasks
    .filter((t) => t.task_type === "question_block" && t.status === "completed")
    .reduce((s, t) => s + (t.completed_quantity || t.target_quantity), 0);
  const questionTarget = items
    .filter((i) => i.kind === "question")
    .reduce((s, i) => s + i.block_count * i.per_block, 0);
  const extras = tasks.filter((t) => !t.r360_item_id);

  return (
    <>
      <PageHeader
        title="Daily 360R"
        subtitle="Lectures, topics studied, question blocks and revisions — logged day by day."
        action={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
            <Button size="icon" variant="ghost" className="size-8" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-40 text-center text-sm font-medium">{formatLongDate(date)}</span>
            <Button size="icon" variant="ghost" className="size-8" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="card-lofi mb-4 flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="font-display text-2xl font-semibold">
            {completed}
            <span className="text-base font-normal text-muted-foreground">/{tasks.length} done</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {lectureCount} lectures · {questionsDone}/{questionTarget} questions today
          </p>
        </div>
        <div className="w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-warm" initial={false} animate={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">{pct}% of the day</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card-lofi h-48 animate-pulse" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nothing logged for this day"
          description="Load your 360R checklist for this date, or add tasks manually below."
          action={
            <Button onClick={() => seedDay.mutate(items)} disabled={seedDay.isPending || !items.length}>
              <CalendarDays className="size-4" /> Load 360R checklist
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {groups.map(
            ({ item, blocks }) =>
              blocks.length > 0 && (
                <div key={item.id} className="card-lofi">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {blocks.filter((b) => b.status === "completed").length}/{blocks.length}
                      {item.per_block > 1 ? ` · ${item.per_block} ${item.unit ?? ""}/block` : ""}
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {blocks.map((t) => (
                      <div key={t.id} className="group flex items-center gap-3 px-4 py-2.5">
                        <StatusBox
                          status={t.status}
                          onClick={() => setStatus.mutate({ id: t.id, status: nextStatus(t.status), quantity: t.target_quantity })}
                          label={`${t.label}: ${statusLabel[t.status]}`}
                        />
                        <p className={`min-w-0 flex-1 truncate text-sm ${t.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                          {t.label}
                          {item.per_block > 1 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.per_block} {item.unit ?? ""}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  {item.kind === "lecture" && (
                    <div className="border-t border-border p-4">
                      <TopicsStudied date={date} lectureCount={item.block_count} />
                    </div>
                  )}
                </div>
              ),
          )}

          {extras.length > 0 && (
            <div className="card-lofi divide-y divide-border">
              {extras.map((t) => (
                <div key={t.id} className="group flex items-center gap-3 px-4 py-2.5">
                  <StatusBox
                    status={t.status}
                    onClick={() => setStatus.mutate({ id: t.id, status: nextStatus(t.status), quantity: t.target_quantity })}
                    label={`${t.label}: ${statusLabel[t.status]}`}
                  />
                  <p className={`min-w-0 flex-1 truncate text-sm ${t.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                    {t.label}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive opacity-60 group-hover:opacity-100"
                    onClick={() => remove.mutate(t.id)}
                    aria-label="Delete task"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim()) return;
          addTask.mutate({ label: label.trim().slice(0, 160), task_type: "custom", target_quantity: 1, position: tasks.length });
          setLabel("");
        }}
      >
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Add an extra task for this day" />
        <Button type="submit" variant="secondary">
          <Plus className="size-4" /> Add
        </Button>
      </form>

      <WeeklyTable items={items} />
    </>
  );
}
