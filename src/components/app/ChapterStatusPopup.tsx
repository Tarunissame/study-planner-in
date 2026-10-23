import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProfile, useSetChapterStatus, useSyllabus } from "@/lib/data";
import { statusLabel, type TopicStatus } from "@/lib/study";
import { toast } from "sonner";

const DISMISS_KEY = "st-chapter-popup-v1";
const OPTIONS: TopicStatus[] = ["blank", "in_progress", "completed"];

/**
 * First-login popup: asks the student to mark every chapter as
 * Not started / Running / Completed, one subject at a time.
 * Shown once per browser until saved or dismissed.
 */
export function ChapterStatusPopup() {
  const { data: profile } = useProfile();
  const { data: syllabus } = useSyllabus();
  const setChapterStatus = useSetChapterStatus();

  const [open, setOpen] = useState(false);
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, TopicStatus>>({});
  const [saving, setSaving] = useState(false);

  const subjects = useMemo(() => syllabus?.subjects ?? [], [syllabus]);
  const subject = subjects[subjectIdx];
  const chapters = useMemo(
    () => (syllabus?.chapters ?? []).filter((c) => c.subject_id === subject?.id),
    [syllabus, subject],
  );

  useEffect(() => {
    if (!profile?.onboarded) return;
    if (!syllabus?.chapters.length) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    setOpen(true);
  }, [profile?.onboarded, syllabus?.chapters.length]);

  useEffect(() => {
    const init: Record<string, TopicStatus> = {};
    for (const c of chapters) init[c.id] = c.status;
    setStatuses(init);
  }, [chapters]);

  async function save() {
    if (!chapters.length) {
      dismiss();
      return;
    }
    setSaving(true);
    try {
      for (const c of chapters) {
        const next = statuses[c.id];
        if (next && next !== c.status) await setChapterStatus.mutateAsync({ id: c.id, status: next });
      }
      localStorage.setItem(DISMISS_KEY, "1");
      setOpen(false);
      toast.success("Chapter statuses saved");
    } catch {
      toast.error("Could not save chapter statuses — try again from the Syllabus page.");
    } finally {
      setSaving(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : dismiss())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Where do your chapters stand?</DialogTitle>
          <DialogDescription>
            Mark each chapter as Not started, Running or Completed — progress everywhere else updates from this.
          </DialogDescription>
        </DialogHeader>

        {subjects.length > 1 && (
          <Select
            value={String(subjectIdx)}
            onValueChange={(v) => setSubjectIdx(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s, i) => (
                <SelectItem key={s.id} value={String(i)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="space-y-2">
          {chapters.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
              <Select value={statuses[c.id] ?? c.status} onValueChange={(v) => setStatuses((p) => ({ ...p, [c.id]: v as TopicStatus }))}>
                <SelectTrigger size="sm" className="w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {statusLabel[o]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          {chapters.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No chapters in this subject yet.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={dismiss}>
            Later
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save statuses"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
