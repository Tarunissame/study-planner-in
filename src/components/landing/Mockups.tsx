import { StatusBox } from "@/components/StatusBox";

function Donut({ pct }: { pct: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} className="fill-none stroke-muted" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="fill-none stroke-primary"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="fill-none stroke-warning"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${0.18 * c} ${c}`}
          strokeDashoffset={`${-(pct / 100) * c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold">{pct}%</span>
        <span className="text-[10px] text-muted-foreground">syllabus</span>
      </div>
    </div>
  );
}

export function DashboardMock() {
  const subjects = [
    { name: "Physics", pct: 62 },
    { name: "Chemistry", pct: 48 },
    { name: "Maths", pct: 71 },
  ];
  return (
    <div className="card-lofi glow-warm w-full p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Good evening, Aarav</p>
          <p className="font-display text-lg font-semibold">Today&apos;s command center</p>
        </div>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">12 day streak</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center rounded-xl bg-surface-2/60 p-4">
          <Donut pct={57} />
        </div>
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s.name} className="rounded-lg border border-border bg-surface-2/50 p-3">
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground">{s.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-warm" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-surface-2/40 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Today&apos;s tasks</p>
        <ul className="space-y-2 text-sm">
          {[
            ["Lecture — Rotational Motion", "completed"],
            ["Questions ×10 — Thermodynamics", "in_progress"],
            ["Revision — Mole Concept (R3)", "blank"],
          ].map(([label, st]) => (
            <li key={label} className="flex items-center gap-3">
              <StatusBox status={st as never} size="sm" />
              <span className={st === "completed" ? "text-muted-foreground line-through" : ""}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SyllabusMock() {
  return (
    <div className="card-lofi w-full p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display font-semibold">Physics</span>
        <span className="text-xs text-muted-foreground">62% · 18/29 topics</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[62%] rounded-full bg-gradient-warm" />
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-lg border border-border bg-surface-2/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Chapter · Rotational Motion</p>
          <ul className="space-y-2">
            {[
              ["Moment of inertia", "completed"],
              ["Torque & angular momentum", "in_progress"],
              ["Rolling motion", "blank"],
            ].map(([n, s]) => (
              <li key={n} className="flex items-center gap-3">
                <StatusBox status={s as never} size="sm" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-dashed border-border p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Free topics</p>
          <div className="flex items-center gap-3">
            <StatusBox status="in_progress" size="sm" />
            <span>Dimensional analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DailyMock() {
  const rows = [
    ["Lecture 1", "Lecture", "completed"],
    ["Lecture 2", "Lecture", "in_progress"],
    ["Questions ×10", "Questions", "completed"],
    ["Questions ×10", "Questions", "blank"],
    ["Revision session", "Revision", "overdue"],
  ];
  return (
    <div className="card-lofi w-full overflow-hidden p-5">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-display font-semibold">Daily 360R</span>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 font-medium">Task</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 text-right font-medium">Done</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, type, st], i) => (
            <tr key={i} className="border-t border-border">
              <td className="py-2.5">{label}</td>
              <td className="py-2.5 text-muted-foreground">{type}</td>
              <td className="py-2.5 text-right">
                <StatusBox
                  size="sm"
                  status={st === "overdue" ? "blank" : (st as never)}
                  overdue={st === "overdue"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RevisionMock() {
  return (
    <div className="card-lofi w-full p-5">
      <p className="font-display font-semibold">Due today</p>
      <p className="mb-4 text-xs text-muted-foreground">3 revisions scheduled by the engine</p>
      <ul className="space-y-2 text-sm">
        {[
          ["Mole Concept", "Chemistry", "R2 · Day 2"],
          ["Kinematics", "Physics", "R4 · Day 4"],
          ["Quadratic Equations", "Maths", "R6 · Day 15"],
        ].map(([topic, subject, tag]) => (
          <li key={topic} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/50 p-3">
            <StatusBox status="blank" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate">{topic}</p>
              <p className="text-xs text-muted-foreground">{subject}</p>
            </div>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent">{tag}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-1.5">
        {[1, 2, 3, 4, 7, 15, 39].map((d) => (
          <span
            key={d}
            className="flex-1 rounded-md border border-border bg-surface-2/60 py-1 text-center text-[11px] text-muted-foreground"
          >
            D{d}
          </span>
        ))}
      </div>
    </div>
  );
}