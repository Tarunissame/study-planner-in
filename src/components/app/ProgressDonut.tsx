import { motion } from "motion/react";
import type { Progress } from "@/lib/study";

export function ProgressDonut({ progress, size = 180 }: { progress: Progress; size?: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const total = Math.max(progress.total, 1);
  const completedLen = (progress.completed / total) * c;
  const inProgressLen = (progress.inProgress / total) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={r} className="fill-none stroke-muted" strokeWidth="16" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          className="fill-none stroke-warning"
          strokeWidth="16"
          strokeLinecap="round"
          initial={false}
          animate={{ strokeDasharray: `${inProgressLen} ${c}`, strokeDashoffset: -completedLen }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          className="fill-none stroke-success"
          strokeWidth="16"
          strokeLinecap="round"
          initial={false}
          animate={{ strokeDasharray: `${completedLen} ${c}` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold">{progress.pct}%</span>
        <span className="text-xs text-muted-foreground">complete</span>
      </div>
    </div>
  );
}

export function LegendRow({ progress }: { progress: Progress }) {
  const items = [
    ["Completed", progress.completed, "bg-success"],
    ["In progress", progress.inProgress, "bg-warning"],
    ["Not started", progress.notStarted, "bg-muted"],
  ] as const;
  return (
    <div className="flex flex-wrap gap-4">
      {items.map(([label, value, color]) => (
        <div key={label} className="flex items-center gap-2 text-sm">
          <span className={`size-2.5 rounded-full ${color}`} />
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value}</span>
        </div>
      ))}
    </div>
  );
}