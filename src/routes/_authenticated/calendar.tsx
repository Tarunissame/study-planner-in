import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useAllDailyTasks } from "@/lib/data";
import { dayColor, scoreDays } from "@/lib/stats";
import { toISODate, todayISO } from "@/lib/study";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Consistency Calendar — StudyTracker" },
      { name: "description", content: "A month-by-month view of how consistently you studied." },
      { property: "og:title", content: "Consistency Calendar — StudyTracker" },
      { property: "og:description", content: "Colour-coded days that show your real study consistency." },
    ],
  }),
  component: CalendarPage,
});

const TONE: Record<string, string> = {
  none: "bg-muted/40 text-muted-foreground",
  poor: "bg-destructive/25 text-foreground",
  partial: "bg-warning/30 text-foreground",
  strong: "bg-success/35 text-foreground",
};

function CalendarPage() {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const { data: tasks = [] } = useAllDailyTasks();
  const scores = scoreDays(tasks);

  const first = new Date(cursor.y, cursor.m, 1);
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const lead = first.getDay();
  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(cursor.y, cursor.m, i + 1))),
  ];

  const shift = (d: number) => {
    const next = new Date(cursor.y, cursor.m + d, 1);
    setCursor({ y: next.getFullYear(), m: next.getMonth() });
  };

  return (
    <>
      <PageHeader
        title="Consistency"
        subtitle="Green means you cleared most of the day. Streaks are built here, not in one big session."
        action={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
            <Button size="icon" variant="ghost" className="size-8" onClick={() => shift(-1)} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-36 text-center text-sm font-medium">
              {first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            <Button size="icon" variant="ghost" className="size-8" onClick={() => shift(1)} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="card-lofi p-4 sm:p-6">
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((iso, i) =>
            iso === null ? (
              <span key={`e${i}`} />
            ) : (
              <div
                key={iso}
                title={`${iso} — ${scores.get(iso)?.completed ?? 0}/${scores.get(iso)?.total ?? 0} tasks`}
                className={`grid aspect-square place-items-center rounded-lg text-xs ${TONE[dayColor(scores.get(iso))]} ${
                  iso === todayISO() ? "ring-2 ring-primary" : ""
                }`}
              >
                {Number(iso.slice(8))}
              </div>
            ),
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {[
            ["No data", "none"],
            ["Light", "poor"],
            ["Good", "partial"],
            ["Strong", "strong"],
          ].map(([label, tone]) => (
            <span key={label} className="flex items-center gap-2">
              <span className={`size-3 rounded ${TONE[tone as string]}`} /> {label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}