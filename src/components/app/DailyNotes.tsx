import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDailyNote, useNoteMutations } from "@/lib/data";
import { addDays, formatLongDate, todayISO } from "@/lib/study";
import { toast } from "sonner";

export function DailyNotes() {
  const today = todayISO();
  const [date, setDate] = useState(today);
  const { data: note, isLoading } = useDailyNote(date);
  const { save, remove } = useNoteMutations();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(note?.content ?? "");
  }, [note, date]);

  const dirty = draft !== (note?.content ?? "");

  return (
    <div className="card-lofi p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-semibold">Daily notes</h2>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="size-8" aria-label="Previous day" onClick={() => setDate((d) => addDays(d, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[9rem] text-center text-xs text-muted-foreground">
            {date === today ? "Today" : formatLongDate(date)}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="Next day"
            disabled={date >= today}
            onClick={() => setDate((d) => addDays(d, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid h-28 place-items-center">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            maxLength={4000}
            placeholder="What went well today? What needs fixing tomorrow?"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              disabled={!dirty || save.isPending}
              onClick={async () => {
                try {
                  await save.mutateAsync({ date, content: draft });
                  toast.success("Note saved");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not save note");
                }
              }}
            >
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {note ? "Update" : "Save"}
            </Button>
            {note && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={async () => {
                  if (!window.confirm("Delete this note?")) return;
                  await remove.mutateAsync(note.id);
                  setDraft("");
                  toast.success("Note deleted");
                }}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            )}
            {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          </div>
        </>
      )}
    </div>
  );
}
