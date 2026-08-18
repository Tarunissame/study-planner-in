import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { SubjectPills } from "@/components/app/SubjectPills";
import { StatusBox } from "@/components/StatusBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChapterStatusPicker } from "@/routes/_authenticated/syllabus";
import {
  useSetChapterStatus,
  useSyllabus,
  useSyllabusMutations,
  useTracking,
  useTrackingMutations,
} from "@/lib/data";
import { nextStatus, statusLabel, type TopicStatus } from "@/lib/study";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tracking")({
  head: () => ({
    meta: [
      { title: "Tracking — StudyTracker" },
      {
        name: "description",
        content: "Chapter-wise resource tracking: modules, PYQs, notes and revisions with live progress per chapter.",
      },
      { property: "og:title", content: "Tracking — StudyTracker" },
      { property: "og:description", content: "Track every chapter across every resource in one grid." },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const { data: syllabus, isLoading } = useSyllabus();
  const { data: tracking, isLoading: loadingTracking } = useTracking();
  const m = useSyllabusMutations();
  const tm = useTrackingMutations();
  const setChapterStatus = useSetChapterStatus();
  const [active, setActive] = useState<string | null>(null);
  const [newResource, setNewResource] = useState("");

  const subjects = syllabus?.subjects ?? [];
  useEffect(() => {
    if (!subjects.length) return;
    if (!active || !subjects.some((s) => s.id === active)) setActive(subjects[0]!.id);
  }, [subjects, active]);

  const chapters = useMemo(
    () => (syllabus?.chapters ?? []).filter((c) => c.subject_id === active),
    [syllabus, active],
  );
  const resources = tracking?.resources ?? [];
  const cells = tracking?.cells ?? [];
  const starred = resources.filter((r) => r.starred);

  const cellStatus = (chapterId: string, resourceId: string): TopicStatus =>
    cells.find((c) => c.chapter_id === chapterId && c.resource_id === resourceId)?.status ?? "blank";

  const chapterPct = (chapterId: string) => {
    if (!starred.length) return 0;
    const score = starred.reduce((acc, r) => {
      const s = cellStatus(chapterId, r.id);
      return acc + (s === "completed" ? 1 : s === "in_progress" ? 0.5 : 0);
    }, 0);
    return Math.round((score / starred.length) * 100);
  };

  return (
    <>
      <PageHeader
        title="Tracking"
        subtitle="Chapter-wise resource tracker. Tap a cell to cycle Not done → Running → Done. Progress counts starred columns only."
      />

      {isLoading || loadingTracking ? (
        <div className="card-lofi grid h-40 place-items-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="card-lofi p-8 text-center text-sm text-muted-foreground">
          Add subjects in the Syllabus first — Tracking shares the same chapters.
        </div>
      ) : (
        <div className="space-y-5">
          <SubjectPills
            subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
            activeId={active}
            onSelect={setActive}
            onReorder={(ids) =>
              m.reorder.mutate({ table: "subjects", items: ids.map((id, position) => ({ id, position })) })
            }
          />

          <div className="card-lofi overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="sticky left-0 z-10 min-w-[220px] bg-card px-3 py-2 text-left font-medium">Chapter</th>
                    <th className="min-w-[190px] px-3 py-2 text-left font-medium">Status</th>
                    {resources.map((r) => (
                      <th key={r.id} className="min-w-[120px] px-2 py-2 text-left font-medium">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => tm.updateResource.mutate({ id: r.id, starred: !r.starred })}
                            aria-label={r.starred ? "Unstar column" : "Star column"}
                            className={cn("shrink-0", r.starred ? "text-primary" : "text-muted-foreground")}
                          >
                            <Star className={cn("size-3.5", r.starred && "fill-current")} />
                          </button>
                          <span className="truncate text-xs">{r.name}</span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete column "${r.name}"?`)) tm.removeResource.mutate(r.id);
                            }}
                            aria-label="Delete column"
                            className="ml-auto text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="min-w-[90px] px-3 py-2 text-right font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((ch) => (
                    <tr key={ch.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/40">
                      <td className="sticky left-0 z-10 max-w-[260px] truncate bg-card px-3 py-2">{ch.name}</td>
                      <td className="px-3 py-2">
                        <ChapterStatusPicker
                          status={ch.status}
                          onChange={(s) => setChapterStatus.mutate({ id: ch.id, status: s })}
                        />
                      </td>
                      {resources.map((r) => {
                        const status = cellStatus(ch.id, r.id);
                        return (
                          <td key={r.id} className="px-2 py-2">
                            <StatusBox
                              status={status}
                              size="sm"
                              label={`${ch.name} · ${r.name}: ${statusLabel[status]}`}
                              onClick={() =>
                                tm.setCell.mutate({
                                  chapter_id: ch.id,
                                  resource_id: r.id,
                                  status: nextStatus(status),
                                })
                              }
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right text-primary">{chapterPct(ch.id)}%</td>
                    </tr>
                  ))}
                  {chapters.length === 0 && (
                    <tr>
                      <td colSpan={resources.length + 3} className="px-3 py-8 text-center text-muted-foreground">
                        No chapters in this subject yet — add them in the Syllabus.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form
            className="flex max-w-sm gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newResource.trim()) return;
              tm.addResource.mutate({ name: newResource.trim().slice(0, 60), position: resources.length });
              setNewResource("");
            }}
          >
            <Input
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              placeholder="Add tracking column (e.g. PYQ 2024)"
              className="h-9"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-9">
              <Plus className="size-3.5" /> Add
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
