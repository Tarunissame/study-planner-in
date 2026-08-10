import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BookOpen, Flame, RefreshCw, Target } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { LegendRow, ProgressDonut } from "@/components/app/ProgressDonut";
import { Button } from "@/components/ui/button";
import { useAllDailyTasks, useDailyTasks, useProfile, useRevisions, useSyllabus } from "@/lib/data";
import { buildTree, overallProgress } from "@/lib/progress";
import { todayISO } from "@/lib/study";
import { computeStreak } from "@/lib/stats";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyTracker" },
      { name: "description", content: "Your overall syllabus progress, subject breakdown and today's study summary." },
      { property: "og:title", content: "Dashboard — StudyTracker" },
      { property: "og:description", content: "See what's done, what's pending and what's due today." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: syllabus } = useSyllabus();
  const today = todayISO();
  const { data: todayTasks = [] } = useDailyTasks(today);
  const { data: allTasks = [] } = useAllDailyTasks();
  const { data: revisions = [] } = useRevisions();

  const tree = syllabus ? buildTree(syllabus) : [];
  const overall = syllabus ? overallProgress(syllabus) : { total: 0, completed: 0, inProgress: 0, notStarted: 0, pct: 0 };
  const dueToday = revisions.filter((r) => r.status === "pending" && r.due_date <= today);
  const doneTasks = todayTasks.filter((t) => t.status === "completed").length;
  const streak = computeStreak(allTasks);

  const stats = [
    { icon: Target, label: "Today's tasks", value: `${doneTasks}/${todayTasks.length}` },
    { icon: RefreshCw, label: "Revisions due", value: dueToday.length },
    { icon: Flame, label: "Current streak", value: `${streak.current}d` },
  ];

  return (
    <>
      <PageHeader
        title={`Hey${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋`}
        subtitle="Here's where your prep stands right now."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-lofi flex flex-col items-center justify-center gap-5 p-6 lg:col-span-1">
          <ProgressDonut progress={overall} />
          <LegendRow progress={overall} />
          <p className="text-xs text-muted-foreground">{overall.total} topics tracked overall</p>
        </div>

        <div className="grid gap-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="card-lofi p-4">
                <span className="mb-3 grid size-9 place-items-center rounded-lg bg-primary/12 text-primary">
                  <s.icon className="size-4" />
                </span>
                <p className="font-display text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card-lofi p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Today&apos;s summary</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/daily">Open Daily 360R</Link>
              </Button>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks for today yet — open Daily 360R to load your daily targets.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {todayTasks.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3">
                    <span className={t.status === "completed" ? "text-muted-foreground line-through" : ""}>{t.label}</span>
                    <span className="text-xs capitalize text-muted-foreground">{t.status.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
            )}
            {dueToday.length > 0 && (
              <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                {dueToday.length} revision{dueToday.length > 1 ? "s" : ""} due today —{" "}
                <Link to="/revision" className="underline underline-offset-4">
                  review now
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-8 font-display text-lg font-semibold">Subjects</h2>
      {tree.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Add your first subject to get started"
          description="Build your syllabus as Subjects → Chapters → Topics. Progress then calculates itself."
          action={
            <Button asChild>
              <Link to="/syllabus">Go to Syllabus</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((node, i) => (
            <motion.div
              key={node.subject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to="/syllabus"
                search={{ subject: node.subject.id }}
                className="card-lofi block p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-display font-semibold">{node.subject.name}</span>
                  <span className="text-sm text-primary">{node.progress.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-warm"
                    initial={{ width: 0 }}
                    animate={{ width: `${node.progress.pct}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {node.progress.completed} done · {node.progress.inProgress} in progress · {node.progress.notStarted}{" "}
                  remaining
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}