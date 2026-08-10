import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ListChecks, Plus, Trash2 } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { StatusBox } from "@/components/StatusBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDailyMutations, useDailyTasks, useProfile } from "@/lib/data";
import { addDays, formatLongDate, nextStatus, statusLabel, todayISO } from "@/lib/study";

export const Route = createFileRoute("/_authenticated/daily")({
  head: () => ({
    meta: [
      { title: "Daily 360R — StudyTracker" },
      { name: "description", content: "Track lectures, questions and revisions for every single day." },
      { property: "og:title", content: "Daily 360R — StudyTracker" },
      { property: "og:description", content: "One clean checklist per day, with targets that carry over." },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const [date, setDate] = useState(todayISO());
  const { data: profile } = useProfile();
  const { data: tasks = [], isLoading } = useDailyTasks(date);
  const { addTask, setStatus, remove, seedDay } = useDailyMutations(date);
  const [label, setLabel] = useState("");

  const completed = tasks.filter((t) => t.status === "completed").length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Daily 360R"
        subtitle="Lectures, questions and revisions — logged day by day."
        action={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
            <Button size="icon" variant="ghost" className="size-8" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-40 text-center text-sm font-medium">{formatLongDate(date)}</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => setDate(addDays(date, 1))}
              disabled={date >= todayISO()}
              aria-label="Next day"
            >
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
            Daily targets: {profile?.default_lecture_target ?? 0} lectures ·{" "}
            {(profile?.default_question_blocks ?? 0) * (profile?.default_questions_per_block ?? 0)} questions
          </p>
        </div>
        <div className="w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-warm" initial={false} animate={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">{pct}% of today</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card-lofi h-48 animate-pulse" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nothing logged for this day"
          description="Load your standard daily targets, or add tasks manually below."
          action={
            <Button onClick={() => profile && seedDay.mutate(profile)} disabled={!profile || seedDay.isPending}>
              <CalendarDays className="size-4" /> Load daily targets
            </Button>
          }
        />
      ) : (
        <div className="card-lofi divide-y divide-border">
          {tasks.map((t) => (
            <div key={t.id} className="group flex items-center gap-3 px-4 py-3">
              <StatusBox
                status={t.status}
                onClick={() =>
                  setStatus.mutate({ id: t.id, status: nextStatus(t.status), quantity: t.target_quantity })
                }
                label={`${t.label}: ${statusLabel[t.status]}`}
              />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${t.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                  {t.label}
                </p>
                <p className="text-xs capitalize text-muted-foreground">{t.task_type.replace("_", " ")}</p>
              </div>
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

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim()) return;
          addTask.mutate({
            label: label.trim().slice(0, 160),
            task_type: "custom",
            target_quantity: 1,
            position: tasks.length,
          });
          setLabel("");
        }}
      >
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Add a task for this day" />
        <Button type="submit" variant="secondary">
          <Plus className="size-4" /> Add
        </Button>
      </form>
    </>
  );
}