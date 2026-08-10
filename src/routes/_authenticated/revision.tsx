import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, RefreshCw, SkipForward } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useRevisionMutations, useRevisions, useSyllabus } from "@/lib/data";
import { REVISION_OFFSETS, formatLongDate, todayISO } from "@/lib/study";

export const Route = createFileRoute("/_authenticated/revision")({
  head: () => ({
    meta: [
      { title: "Spaced Revision — StudyTracker" },
      { name: "description", content: "Automatic Day 1, 2, 3, 4, 7, 15 and 39 revision schedule for every completed topic." },
      { property: "og:title", content: "Spaced Revision — StudyTracker" },
      { property: "og:description", content: "Finish a topic and the whole revision ladder is scheduled for you." },
    ],
  }),
  component: RevisionPage,
});

function RevisionPage() {
  const today = todayISO();
  const { data: revisions = [], isLoading } = useRevisions();
  const { data: syllabus } = useSyllabus();
  const { complete, skip } = useRevisionMutations();

  const topicName = (id: string) => syllabus?.topics.find((t) => t.id === id)?.name ?? "Topic";
  const pending = revisions.filter((r) => r.status === "pending");
  const overdue = pending.filter((r) => r.due_date < today);
  const dueToday = pending.filter((r) => r.due_date === today);
  const upcoming = pending.filter((r) => r.due_date > today).slice(0, 40);
  const doneCount = revisions.filter((r) => r.status === "completed").length;

  const groups = [
    { key: "overdue", title: "Overdue", items: overdue, tone: "text-destructive" },
    { key: "today", title: "Due today", items: dueToday, tone: "text-primary" },
    { key: "upcoming", title: "Upcoming", items: upcoming, tone: "text-muted-foreground" },
  ];

  return (
    <>
      <PageHeader
        title="Spaced Revision"
        subtitle={`Every completed topic is auto-scheduled on days ${REVISION_OFFSETS.join(", ")}.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Overdue", overdue.length],
          ["Due today", dueToday.length],
          ["Scheduled", pending.length],
          ["Revised", doneCount],
        ].map(([label, value]) => (
          <div key={label as string} className="card-lofi p-4">
            <p className="font-display text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="card-lofi h-48 animate-pulse" />
      ) : pending.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="No revisions scheduled yet"
          description="Mark a topic complete in your syllabus and StudyTracker schedules its full revision ladder automatically."
        />
      ) : (
        <div className="space-y-8">
          {groups.map(
            (g) =>
              g.items.length > 0 && (
                <section key={g.key}>
                  <h2 className={`mb-3 font-display text-sm font-semibold uppercase tracking-wide ${g.tone}`}>
                    {g.title} · {g.items.length}
                  </h2>
                  <div className="card-lofi divide-y divide-border">
                    {g.items.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i, 10) * 0.02 }}
                        className="flex flex-wrap items-center gap-3 px-4 py-3"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-xs font-semibold text-primary">
                          D{r.offset_days}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{topicName(r.topic_id)}</p>
                          <p className="text-xs text-muted-foreground">Due {formatLongDate(r.due_date)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => complete.mutate(r.id)}>
                            <CheckCircle2 className="size-3.5" /> Done
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => skip.mutate(r.id)}>
                            <SkipForward className="size-3.5" /> Skip
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ),
          )}
        </div>
      )}
    </>
  );
}