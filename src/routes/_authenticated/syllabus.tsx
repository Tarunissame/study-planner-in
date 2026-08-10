import { useState } from "react";
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
} from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app/AppShell";
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
  useSetTopicStatus,
  useSyllabus,
  useSyllabusMutations,
  useTrackerColumns,
  useTrackerColumnMutations,
} from "@/lib/data";
import { buildTree, type SubjectNode } from "@/lib/progress";
import { nextStatus, statusLabel } from "@/lib/study";
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

function TrackerColumnsDialog() {
  const { data: syllabus } = useSyllabus();
  const { data: tracker } = useTrackerColumns();
  const { create, remove } = useTrackerColumnMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("checkbox");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [scopeKind, setScopeKind] = useState<"subject" | "chapter" | "topic">("subject");
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
          <Columns3 className="size-4" /> Tracking columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom tracking columns</DialogTitle>
          <DialogDescription>
            Track extras like PYQ, NCERT or Module against a whole subject, a chapter or a single topic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="PYQ" />
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

function TopicRow({
  topic,
  columns,
  onCycle,
  onRename,
  onDelete,
}: {
  topic: { id: string; name: string; status: "blank" | "in_progress" | "completed" };
  columns: string[];
  onCycle: () => void;
  onRename: () => void;
  onDelete: () => void;
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
      <RowActions onRename={onRename} onDelete={onDelete} />
    </div>
  );
}

function SubjectCard({ node, defaultOpen }: { node: SubjectNode; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const m = useSyllabusMutations();
  const setStatus = useSetTopicStatus();
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

  const rename = (table: "subjects" | "chapters" | "topics", id: string, current: string) => {
    const name = window.prompt("New name", current);
    if (name?.trim()) m.rename.mutate({ table, id, name: name.trim().slice(0, 120) });
  };
  const remove = (table: "subjects" | "chapters" | "topics", id: string, what: string) => {
    if (window.confirm(`Delete this ${what}? Everything inside it is removed too.`)) m.remove.mutate({ table, id });
  };

  return (
    <div className="card-lofi overflow-hidden">
      <div className="group flex items-center gap-3 p-4">
        <button onClick={() => setOpen((v) => !v)} className="text-muted-foreground" aria-label="Toggle subject">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-display font-semibold">{node.subject.name}</span>
            <span className="shrink-0 text-sm text-primary">{node.progress.pct}%</span>
          </div>
          <div className="mt-2">
            <ProgressBar pct={node.progress.pct} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {node.progress.completed}/{node.progress.total} topics · {node.chapters.length} chapters
          </p>
        </div>
        <RowActions
          onRename={() => rename("subjects", node.subject.id, node.subject.name)}
          onDelete={() => remove("subjects", node.subject.id, "subject")}
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="space-y-4 p-4">
              {node.chapters.map((ch, idx) => {
                const chOpen = openChapters[ch.chapter.id] ?? true;
                return (
                  <div key={ch.chapter.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
                    <div className="group flex items-center gap-2">
                      <button
                        onClick={() => setOpenChapters((s) => ({ ...s, [ch.chapter.id]: !chOpen }))}
                        className="text-muted-foreground"
                        aria-label="Toggle chapter"
                      >
                        {chOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                      <span className="flex-1 truncate text-sm font-medium">{ch.chapter.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {ch.progress.completed}/{ch.progress.total} · {ch.progress.pct}%
                      </span>
                      <RowActions
                        onRename={() => rename("chapters", ch.chapter.id, ch.chapter.name)}
                        onDelete={() => remove("chapters", ch.chapter.id, "chapter")}
                        onUp={
                          idx > 0
                            ? () =>
                                m.reorder.mutate({
                                  table: "chapters",
                                  items: [
                                    { id: ch.chapter.id, position: idx - 1 },
                                    { id: node.chapters[idx - 1]!.chapter.id, position: idx },
                                  ],
                                })
                            : undefined
                        }
                        onDown={
                          idx < node.chapters.length - 1
                            ? () =>
                                m.reorder.mutate({
                                  table: "chapters",
                                  items: [
                                    { id: ch.chapter.id, position: idx + 1 },
                                    { id: node.chapters[idx + 1]!.chapter.id, position: idx },
                                  ],
                                })
                            : undefined
                        }
                      />
                    </div>
                    <div className="mt-2">
                      <ProgressBar pct={ch.progress.pct} />
                    </div>
                    {chOpen && (
                      <div className="mt-3 space-y-1">
                        {ch.topics.map((t) => (
                          <TopicRow
                            key={t.id}
                            topic={t}
                            columns={columnsFor({ subjectId: node.subject.id, chapterId: ch.chapter.id, topicId: t.id })}
                            onCycle={() => setStatus.mutate({ id: t.id, status: nextStatus(t.status) })}
                            onRename={() => rename("topics", t.id, t.name)}
                            onDelete={() => remove("topics", t.id, "topic")}
                          />
                        ))}
                        <div className="pt-2">
                          <InlineAdd
                            placeholder="New topic"
                            onAdd={(name) =>
                              m.addTopic.mutate({
                                name,
                                subject_id: node.subject.id,
                                chapter_id: ch.chapter.id,
                                position: ch.topics.length,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <InlineAdd
                placeholder="New chapter"
                onAdd={(name) =>
                  m.addChapter.mutate({ name, subject_id: node.subject.id, position: node.chapters.length })
                }
              />

              <div className="rounded-lg border border-dashed border-border p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Free topics</p>
                <div className="space-y-1">
                  {node.freeTopics.map((t) => (
                    <TopicRow
                      key={t.id}
                      topic={t}
                      columns={columnsFor({ subjectId: node.subject.id, topicId: t.id })}
                      onCycle={() => setStatus.mutate({ id: t.id, status: nextStatus(t.status) })}
                      onRename={() => rename("topics", t.id, t.name)}
                      onDelete={() => remove("topics", t.id, "topic")}
                    />
                  ))}
                </div>
                <div className="pt-2">
                  <InlineAdd
                    placeholder="Topic without a chapter"
                    onAdd={(name) =>
                      m.addTopic.mutate({
                        name,
                        subject_id: node.subject.id,
                        chapter_id: null,
                        position: node.freeTopics.length,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SyllabusPage() {
  const { subject } = Route.useSearch();
  const { data: syllabus, isLoading } = useSyllabus();
  const m = useSyllabusMutations();
  const tree = syllabus ? buildTree(syllabus) : [];

  return (
    <>
      <PageHeader
        title="Syllabus"
        subtitle="Subjects → Chapters → Topics. Tap a box to cycle blank → in progress → completed."
        action={<TrackerColumnsDialog />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-lofi h-24 animate-pulse" />
          ))}
        </div>
      ) : tree.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your syllabus is empty"
          description="Add your first subject — then chapters and topics. Progress calculates itself from there."
          action={<InlineAdd placeholder="e.g. Physics" onAdd={(name) => m.addSubject.mutate({ name, position: 0 })} />}
        />
      ) : (
        <div className="space-y-4">
          {tree.map((node) => (
            <SubjectCard key={node.subject.id} node={node} defaultOpen={subject === node.subject.id || tree.length <= 2} />
          ))}
          <div className="card-lofi p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Add subject</p>
            <InlineAdd placeholder="e.g. Chemistry" onAdd={(name) => m.addSubject.mutate({ name, position: tree.length })} />
          </div>
        </div>
      )}
    </>
  );
}