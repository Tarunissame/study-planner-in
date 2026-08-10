import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/lib/data";
import { BOARDS, CLASSES, EXAMS, STREAMS } from "@/lib/study";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — StudyTracker" },
      { name: "description", content: "Tell StudyTracker your class, board, stream and target exam." },
      { property: "og:title", content: "Set up your profile — StudyTracker" },
      { property: "og:description", content: "A few details and your study workspace is ready." },
    ],
  }),
  component: Onboarding,
});

function Field({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
}

function Onboarding() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [board, setBoard] = useState("");
  const [stream, setStream] = useState("");
  const [exam, setExam] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setCls(profile.class ?? "");
      setBoard(profile.board ?? "");
      setStream(profile.stream ?? "");
      setExam(profile.exam ?? "");
      if (profile.onboarded) navigate({ to: "/dashboard", replace: true });
    }
  }, [profile, navigate]);

  async function save() {
    if (!name.trim()) {
      toast.error("Please add your name");
      return;
    }
    try {
      await update.mutateAsync({
        name: name.trim(),
        class: cls || null,
        board: board || null,
        stream: stream || null,
        exam: exam || null,
        onboarded: true,
      });
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your profile");
    }
  }

  return (
    <main className="ambient grain flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-lofi w-full max-w-lg p-6 sm:p-8">
        <span className="mb-4 inline-grid size-10 place-items-center rounded-lg bg-gradient-warm text-primary-foreground">
          <BookOpen className="size-5" />
        </span>
        <h1 className="text-2xl font-semibold">Let&apos;s set up your workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This tailors your dashboard. You&apos;ll build your syllabus next — nothing is locked in.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ob-name">Name</Label>
            <Input id="ob-name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Class" value={cls} options={CLASSES} onChange={setCls} />
            <Field label="Board" value={board} options={BOARDS} onChange={setBoard} />
            <Field label="Stream" value={stream} options={STREAMS} onChange={setStream} />
            <Field label="Exam" value={exam} options={EXAMS} onChange={setExam} />
          </div>
        </div>
        <Button className="mt-6 w-full" onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="size-4 animate-spin" /> : "Enter StudyTracker"}
        </Button>
      </motion.div>
    </main>
  );
}