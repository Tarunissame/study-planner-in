import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";
import {
  ChevronDown,
  ChevronRight,
  Columns3,
  BookOpen,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { StatusBox } from "@/components/StatusBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAddSubject,
  useSetChapterStatus,
  useSetTopicStatus,
  useSyllabus,
  useSyllabusMutations,
  useTrackerColumns,
  useTrackerColumnMutations,
} from "@/lib/data";
import { buildTree, type ChapterNode, type SubjectNode } from "@/lib/progress";
import { nextStatus, statusLabel } from "@/lib/study";
import { ADDITIONAL_SUBJECTS, templateFor } from "@/lib/syllabus-templates";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/syllabus")({
  validateSearch: z.object({ subject: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Syllabus — StudyTracker" },
      { name: "description", content: "Build and track your syllabus: subjects, chapters, topics and free topics." },
      { property: "og:title", content: "Syllabus — StudyTracker" },
      { property: "og:description", content: "Three-state topic tracking with progress that rolls up automatically." },
    ],
  }),
  component: SyllabusPage,
});

function InlineAdd({ placeholder, onAdd }: { placeholder: string; onAdd: (name: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value.trim().slice(0, 120));
        setValue("");
      }}
      className="flex gap-2"
    >
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
      <Button type="submit" size="sm" variant="secondary" className="h-8">
        <Plus className="size-3.5" /> Add
      </Button>
    </form>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full bg-gradient-warm"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function RowActions({
  onRename,
  onDelete,
  onUp,
  onDown,
}: {
  onRename: () => void;
  onDelete: () => void;
  onUp?: (() => void) | undefined;
  onDown?: (() => void) | undefined;
}) {
  return (
    <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
      {onUp && (
        <Button size="icon" variant="ghost" className="size-7" onClick={onUp} aria-label="Move up">
          <ArrowUp className="size-3.5" />
        </Button>
      )}
      {onDown && (
        <Button size="icon" variant="ghost" className="size-7" onClick={onDown} aria-label="Move down">
          <ArrowDown className="size-3.5" />
        </Button>
      )}
      <Button size="icon" variant="ghost" className="size-7" onClick={onRename} aria-label="Rename">
        <Pencil className="size-3.5" />
      </Button>
      <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={onDelete} aria-label="Delete">
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

/* ---------------- add subject ---------------- */

function AddSubjectDialog({ position }: { position: number }) {
  const add = useAddSubject();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  async function create(name: string) {
    if (!name.trim()) return;
    try {
      await add.mutateAsync({ name: name.trim().slice(0, 60), position });
      toast.success(
        templateFor(name) ? `${name} added with its syllabus` : `${name} added — add chapters to build its syllabus`,
      );
      setCustom("");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add subject");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-full border border-dashed border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">
          <Plus className="mr-1 inline size-3.5" /> Add Subject
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a subject</DialogTitle>
          <DialogDescription>
            Standard subjects come with their chapters and topics ready. Anything else starts blank and you build it yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ADDITIONAL_SUBJECTS.map((s) => (
              <button
                key={s}
                disabled={add.isPending}
                onClick={() => create(s)}
                className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-primary/60 hover:bg-surface-2"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custom-subject">Custom subject</Label>
            <div className="flex gap-2">
              <Input
                id="custom-subject"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="e.g. Sanskrit"
                onKeyDown={(e) => {
                  if (e.key === "Enter") create(custom);
                }}
              />
              <Button onClick={() => create(custom)} disabled={add.isPending}>
                {add.isPending ? <Loader2 className="size-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- tracking columns ---------------- */

function TrackerColumnsDialog() {
  const { data: syllabus } = useSyllabus();
  const { data: tracker } = useTrackerColumns();
  const { create, remove } = useTrackerColumnMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("checkbox");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [scopeKind, setScopeKind] = useState<"subject" | "chapter" | "topic">("chapter");
  const [scopeId, setScopeId] = useState("");

  const options =
    scopeKind === "subject"
      ? (syllabus?.subjects ?? []).map((s) => ({ id: s.id, name: s.name }))
      : scopeKind === "chapter"
        ? (syllabus?.chapters ?? []).map((c) => ({ id: c.id, name: c.name }))
        : (syllabus?.topics ?? []).map((t) => ({ id: t.id, name: t.name }));

  async function submit() {
    if (!name.trim() || !scopeId) {
      toast.error("Add a column name and pick what it applies to");
      return;
    }
    await create.mutateAsync({
      name: name.trim().slice(0, 60),
      type,
      target: target ? Number(target) : null,
      unit: unit.trim() || null,
      scopes: [
        {
          subject_id: scopeKind === "subject" ? scopeId : null,
          chapter_id: scopeKind === "chapter" ? scopeId : null,
          topic_id: scopeKind === "topic" ? scopeId : null,
        },
      ],
    });
    toast.success("Tracking column added");
    setName("");
    setTarget("");
    setUnit("");
    setScopeId("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns3 className="size-4" /> Custom columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom tracking columns</DialogTitle>
          <DialogDescription>
            Track extras like Formula Sheet, Teacher Assignment or Custom Revision against a subject, one chapter or a single topic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Formula Sheet" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Target (optional)</Label>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric" placeholder="30" />
            </div>
            <div className="space-y-1.5">
              <Label>Unit (optional)</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="questions" />
            </div>
            <div className="space-y-1.5">
              <Label>Applies to</Label>
              <Select
                value={scopeKind}
                onValueChange={(v) => {
                  setScopeKind(v as typeof scopeKind);
                  setScopeId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subject">Whole subject</SelectItem>
                  <SelectItem value="chapter">A chapter</SelectItem>
                  <SelectItem value="topic">A topic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select value={scopeId} onValueChange={setScopeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(tracker?.columns.length ?? 0) > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Existing columns</p>
              {tracker?.columns.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>
                    {c.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {c.type}
                      {c.target ? ` · target ${c.target}${c.unit ? ` ${c.unit}` : ""}` : ""}
                    </span>
                  </span>
                  <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => remove.mutate(c.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={create.isPending}>
            Add column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- rows ---------------- */

function TopicRow({
  topic,
  columns,
  onCycle,
  onRename,
  onDelete,
  onUp,
  onDown,
}: {
  topic: { id: string; name: string; status: "blank" | "in_progress" | "completed" };
  columns: string[];
  onCycle: () => void;
  onRename: () => void;
  onDelete: () => void;
  onUp?: (() => void) | undefined;
  onDown?: (() => void) | undefined;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2/60">
      <StatusBox status={topic.status} size="sm" onClick={onCycle} label={`${topic.name}: ${statusLabel[topic.status]}`} />
      <span className={`flex-1 truncate text-sm ${topic.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
        {topic.name}
      </span>
      {columns.map((c) => (
        <span key={c} className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
          {c}
        </span>
      ))}
      <RowActions onRename={onRename} onDelete={onDelete} onUp={onUp} onDown={onDown} />
    </div>
  );
}

const CHAPTER_STATUS_LABEL: Record<string, string> = {
  blank: "Not Done",
  in_progress: "Running",
  completed: "Completed",
};

export function ChapterStatusPicker({
  status,
  onChange,
  size = "md",
}: {
  status: "blank" | "in_progress" | "completed";
  onChange: (s: "blank" | "in_progress" | "completed") => void;
  size?: "sm" | "md";
}) {
  const options: Array<"blank" | "in_progress" | "completed"> = ["blank", "in_progress", "completed"];
  return (
    <div className={cn("flex shrink-0 items-center gap-1 rounded-full border border-border p-0.5", size === "sm" && "text-[11px]")}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] transition-colors",
            status === o
              ? o === "completed"
                ? "bg-success/20 text-success"
                : o === "in_progress"
                  ? "bg-warning/20 text-warning"
                  : "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {CHAPTER_STATUS_LABEL[o]}
        </button>
      ))}
    </div>
  );
}

function ChapterCard({
  node,
  index,
  total,
  subjectId,
  columnsFor,
  onMove,
}: {
  node: ChapterNode;
  index: number;
  total: number;
  subjectId: string;
  columnsFor: (ids: { subjectId: string; chapterId?: string | null; topicId?: string }) => string[];
  onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(true);
  const m = useSyllabusMutations();
  const setTopicStatus = useSetTopicStatus();
  const setChapterStatus = useSetChapterStatus();

  const rename = (table: "chapters" | "topics", id: string, current: string) => {
    const name = window.prompt("New name", current);
    if (name?.trim()) m.rename.mutate({ table, id, name: name.trim().slice(0, 120) });
  };
  const remove = (table: "chapters" | "topics", id: string, what: string) => {
    if (window.confirm(`Delete this ${what}? Everything inside it is removed too.`)) m.remove.mutate({ table, id });
  };
  const moveTopic = (i: number, dir: -1 | 1) => {
    const a = node.topics[i];
    const b = node.topics[i + dir];
    if (!a || !b) return;
    m.reorder.mutate({ table: "topics", items: [{ id: a.id, position: i + dir }, { id: b.id, position: i }] });
  };

  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-3">
      <div className="group flex flex-wrap items-center gap-2">
        <button onClick={() => setOpen((v) => !v)} className="text-muted-foreground" aria-label="Toggle chapter">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{node.chapter.name}</span>
        <ChapterStatusPicker
          status={node.chapter.status}
          onChange={(s) => setChapterStatus.mutate({ id: node.chapter.id, status: s })}
        />
        <span className="text-xs text-muted-foreground">
          {node.progress.completed}/{node.progress.total} · {node.progress.pct}%
        </span>
        <RowActions
          onRename={() => rename("chapters", node.chapter.id, node.chapter.name)}
          onDelete={() => remove("chapters", node.chapter.id, "chapter")}
          onUp={index > 0 ? () => onMove(-1) : undefined}
          onDown={index < total - 1 ? () => onMove(1) : undefined}
        />
      </div>
      <div className="mt-2">
        <ProgressBar pct={node.progress.pct} />
      </div>
      {open && (
        <div className="mt-3 space-y-1">
          {node.topics.map((t, i) => (
            <TopicRow
              key={t.id}
              topic={t}
              columns={columnsFor({ subjectId, chapterId: node.chapter.id, topicId: t.id })}
              onCycle={() => setTopicStatus.mutate({ id: t.id, status: nextStatus(t.status) })}
              onRename={() => rename("topics", t.id, t.name)}
              onDelete={() => remove("topics", t.id, "topic")}
              onUp={i > 0 ? () => moveTopic(i, -1) : undefined}
              onDown={i < node.topics.length - 1 ? () => moveTopic(i, 1) : undefined}
            />
          ))}
          <div className="pt-2">
            <InlineAdd
              placeholder="Add topic"
              onAdd={(name) =>
                m.addTopic.mutate({ name, subject_id: subjectId, chapter_id: node.chapter.id, position: node.topics.length })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectPanel({ node }: { node: SubjectNode }) {
  const m = useSyllabusMutations();
  const setTopicStatus = useSetTopicStatus();
  const { data: tracker } = useTrackerColumns();

  const columnsFor = (ids: { subjectId: string; chapterId?: string | null; topicId?: string }) =>
    (tracker?.scopes ?? [])
      .filter(
        (s) =>
          (s.subject_id && s.subject_id === ids.subjectId) ||
          (s.chapter_id && s.chapter_id === ids.chapterId) ||
          (s.topic_id && s.topic_id === ids.topicId),
      )
      .map((s) => tracker?.columns.find((c) => c.id === s.tracker_column_id)?.name)
      .filter((n): n is string => !!n);

  const rename = (table: "subjects" | "topics", id: string, current: string) => {
    const name = window.prompt("New name", current);
    if (name?.trim()) m.rename.mutate({ table, id, name: name.trim().slice(0, 120) });
  };
  const remove = (table: "subjects" | "topics", id: string, what: string) => {
    if (window.confirm(`Delete this ${what}? Everything inside it is removed too.`)) m.remove.mutate({ table, id });
  };
  const moveChapter = (i: number, dir: -1 | 1) => {
    const a = node.chapters[i];
    const b = node.chapters[i + dir];
    if (!a || !b) return;
    m.reorder.mutate({
      table: "chapters",
      items: [{ id: a.chapter.id, position: i + dir }, { id: b.chapter.id, position: i }],
    });
  };
  const moveFree = (i: number, dir: -1 | 1) => {
    const a = node.freeTopics[i];
    const b = node.freeTopics[i + dir];
    if (!a || !b) return;
    m.reorder.mutate({ table: "topics", items: [{ id: a.id, position: i + dir }, { id: b.id, position: i }] });
  };

  return (
    <div className="space-y-4">
      <div className="card-lofi group p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="truncate font-display text-lg font-semibold">{node.subject.name} progress</h2>
          <span className="shrink-0 text-sm text-primary">{node.progress.pct}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar pct={node.progress.pct} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {node.progress.completed}/{node.progress.total} topics · {node.chapters.length} chapters ·{" "}
            {node.freeTopics.length} free topics
          </p>
          <RowActions
            onRename={() => rename("subjects", node.subject.id, node.subject.name)}
            onDelete={() => remove("subjects", node.subject.id, "subject")}
          />
        </div>
      </div>

      {node.chapters.map((ch, i) => (
        <ChapterCard
          key={ch.chapter.id}
          node={ch}
          index={i}
          total={node.chapters.length}
          subjectId={node.subject.id}
          columnsFor={columnsFor}
          onMove={(dir) => moveChapter(i, dir)}
        />
      ))}

      <div className="card-lofi p-3">
        <InlineAdd
          placeholder="Add chapter"
          onAdd={(name) => m.addChapter.mutate({ name, subject_id: node.subject.id, position: node.chapters.length })}
        />
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Free topics</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Topics that don&apos;t belong to any chapter — formula revision, coaching extras, doubts. They still feed 360R,
          revisions and progress.
        </p>
        <div className="space-y-1">
          {node.freeTopics.map((t, i) => (
            <TopicRow
              key={t.id}
              topic={t}
              columns={columnsFor({ subjectId: node.subject.id, topicId: t.id })}
              onCycle={() => setTopicStatus.mutate({ id: t.id, status: nextStatus(t.status) })}
              onRename={() => rename("topics", t.id, t.name)}
              onDelete={() => remove("topics", t.id, "topic")}
              onUp={i > 0 ? () => moveFree(i, -1) : undefined}
              onDown={i < node.freeTopics.length - 1 ? () => moveFree(i, 1) : undefined}
            />
          ))}
        </div>
        <div className="pt-2">
          <InlineAdd
            placeholder="Add free topic"
            onAdd={(name) =>
              m.addTopic.mutate({ name, subject_id: node.subject.id, chapter_id: null, position: node.freeTopics.length })
            }
          />
        </div>
      </div>
    </div>
  );
}

function SyllabusPage() {
  const { subject } = Route.useSearch();
  const { data: syllabus, isLoading } = useSyllabus();
  const tree = useMemo(() => (syllabus ? buildTree(syllabus) : []), [syllabus]);
  const [active, setActive] = useState<string | null>(subject ?? null);

  useEffect(() => {
    if (tree.length === 0) return;
    if (!active || !tree.some((n) => n.subject.id === active)) setActive(tree[0]!.subject.id);
  }, [tree, active]);

  const current = tree.find((n) => n.subject.id === active) ?? tree[0];

  return (
    <>
      <PageHeader
        title="Syllabus"
        subtitle="Pick a subject, then work through chapters, topics and free topics. Everything is editable."
        action={<TrackerColumnsDialog />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-lofi h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {tree.map((n) => (
              <button
                key={n.subject.id}
                onClick={() => setActive(n.subject.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  n.subject.id === current?.subject.id
                    ? "border-primary/60 bg-gradient-warm text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {n.subject.name}
                <span className="ml-2 text-[11px] opacity-80">{n.progress.pct}%</span>
              </button>
            ))}
            <AddSubjectDialog position={tree.length} />
          </div>

          {current ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.subject.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SubjectPanel node={current} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="card-lofi grid place-items-center gap-3 p-10 text-center">
              <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-primary">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="font-display font-semibold">No subjects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a subject and, if it&apos;s a standard one, its chapters and topics come pre-filled.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <AddSubjectDialog position={0} />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
