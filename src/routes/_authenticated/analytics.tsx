import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/app/AppShell";
import { useAllDailyTasks, useRevisions, useSyllabus } from "@/lib/data";
import { buildTree, overallProgress } from "@/lib/progress";
import { computeStreak, scoreDays } from "@/lib/stats";
import { addDays, todayISO } from "@/lib/study";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — StudyTracker" },
      { name: "description", content: "Subject-wise progress, completion trends and revision stats." },
      { property: "og:title", content: "Analytics — StudyTracker" },
      { property: "og:description", content: "Numbers that tell you where prep is actually going." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: syllabus } = useSyllabus();
  const { data: tasks = [] } = useAllDailyTasks();
  const { data: revisions = [] } = useRevisions();

  const tree = syllabus ? buildTree(syllabus) : [];
  const overall = syllabus ? overallProgress(syllabus) : null;
  const streak = computeStreak(tasks);
  const scores = scoreDays(tasks);
  const last14 = Array.from({ length: 14 }, (_, i) => addDays(todayISO(), i - 13)).map((d) => ({
    day: d.slice(5),
    completed: scores.get(d)?.completed ?? 0,
  }));
  const subjectData = tree.map((n) => ({ name: n.subject.name.slice(0, 10), pct: n.progress.pct }));
  const revisionsDone = revisions.filter((r) => r.status === "completed").length;

  const stats = [
    ["Syllabus complete", `${overall?.pct ?? 0}%`],
    ["Tasks completed", tasks.filter((t) => t.status === "completed").length],
    ["Revisions done", revisionsDone],
    ["Longest streak", `${streak.longest}d`],
  ] as const;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Where your effort is going, and what it's producing." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card-lofi p-4">
            <p className="font-display text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-lofi p-5">
          <h2 className="mb-4 font-display text-base font-semibold">Tasks completed · last 14 days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="completed" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-lofi p-5">
          <h2 className="mb-4 font-display text-base font-semibold">Subject-wise completion</h2>
          {subjectData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add subjects to see this chart.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="pct" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}