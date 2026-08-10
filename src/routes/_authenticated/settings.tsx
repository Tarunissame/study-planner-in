import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/lib/data";
import { BOARDS, CLASSES, EXAMS, STREAMS } from "@/lib/study";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StudyTracker" },
      { name: "description", content: "Update your profile details and daily study targets." },
      { property: "og:title", content: "Settings — StudyTracker" },
      { property: "og:description", content: "Tune your daily lecture and question targets." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    class: "",
    board: "",
    stream: "",
    exam: "",
    default_lecture_target: 4,
    default_question_blocks: 3,
    default_questions_per_block: 10,
  });

  useEffect(() => {
    if (profile)
      setForm({
        name: profile.name ?? "",
        class: profile.class ?? "",
        board: profile.board ?? "",
        stream: profile.stream ?? "",
        exam: profile.exam ?? "",
        default_lecture_target: profile.default_lecture_target,
        default_question_blocks: profile.default_question_blocks,
        default_questions_per_block: profile.default_questions_per_block,
      });
  }, [profile]);

  const num = (v: string) => Math.max(0, Math.min(50, Number(v) || 0));

  async function save() {
    try {
      await update.mutateAsync({
        name: form.name.trim().slice(0, 100),
        class: form.class || null,
        board: form.board || null,
        stream: form.stream || null,
        exam: form.exam || null,
        default_lecture_target: form.default_lecture_target,
        default_question_blocks: form.default_question_blocks,
        default_questions_per_block: form.default_questions_per_block,
      });
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save settings");
    }
  }

  const selects = [
    ["Class", "class", CLASSES],
    ["Board", "board", BOARDS],
    ["Stream", "stream", STREAMS],
    ["Exam", "exam", EXAMS],
  ] as const;

  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile and the daily targets used by Daily 360R." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-lofi space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Profile</h2>
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Name</Label>
            <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {selects.map(([label, key, options]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Select value={form[key]} onValueChange={(v) => setForm({ ...form, [key]: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        <div className="card-lofi space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Daily targets</h2>
          <div className="space-y-1.5">
            <Label htmlFor="s-lect">Lectures per day</Label>
            <Input
              id="s-lect"
              inputMode="numeric"
              value={form.default_lecture_target}
              onChange={(e) => setForm({ ...form, default_lecture_target: num(e.target.value) })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-blocks">Question blocks</Label>
              <Input
                id="s-blocks"
                inputMode="numeric"
                value={form.default_question_blocks}
                onChange={(e) => setForm({ ...form, default_question_blocks: num(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-per">Questions per block</Label>
              <Input
                id="s-per"
                inputMode="numeric"
                value={form.default_questions_per_block}
                onChange={(e) => setForm({ ...form, default_questions_per_block: num(e.target.value) })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            That&apos;s {form.default_lecture_target} lectures and{" "}
            {form.default_question_blocks * form.default_questions_per_block} questions each day.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={update.isPending}>
          Save changes
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth", replace: true });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </>
  );
}