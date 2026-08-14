import { useState } from "react";
import { cn } from "@/lib/utils";

export type SubjectPill = { id: string; name: string; badge?: string };

/** Horizontal subject switcher whose pills can be dragged to reorder. */
export function SubjectPills({
  subjects,
  activeId,
  onSelect,
  onReorder,
  trailing,
}: {
  subjects: SubjectPill[];
  activeId: string | null | undefined;
  onSelect: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  trailing?: React.ReactNode;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const ids = subjects.map((s) => s.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    setDragId(null);
    setOverId(null);
    onReorder(ids);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {subjects.map((s) => (
        <button
          key={s.id}
          draggable
          onDragStart={() => setDragId(s.id)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverId(s.id);
          }}
          onDragLeave={() => setOverId((v) => (v === s.id ? null : v))}
          onDrop={() => drop(s.id)}
          onDragEnd={() => {
            setDragId(null);
            setOverId(null);
          }}
          onClick={() => onSelect(s.id)}
          title="Drag to reorder"
          className={cn(
            "cursor-grab rounded-full border px-4 py-1.5 text-sm transition-colors active:cursor-grabbing",
            s.id === activeId
              ? "border-primary/60 bg-gradient-warm text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            overId === s.id && dragId && dragId !== s.id && "ring-2 ring-primary/50",
            dragId === s.id && "opacity-50",
          )}
        >
          {s.name}
          {s.badge && <span className="ml-2 text-[11px] opacity-80">{s.badge}</span>}
        </button>
      ))}
      {trailing}
    </div>
  );
}
