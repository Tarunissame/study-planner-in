import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/ai")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — StudyTracker" },
      { name: "description", content: "Your upcoming AI study partner: plans, doubts and revision nudges." },
      { property: "og:title", content: "AI Study Assistant — StudyTracker" },
      { property: "og:description", content: "Coming soon — an assistant that knows your syllabus." },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  return (
    <>
      <PageHeader title="AI Study Assistant" subtitle="Coming soon — an assistant that reads your syllabus and plans with you." />
      <div className="card-lofi flex min-h-[420px] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-gradient-warm text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <h2 className="font-display text-lg font-semibold">Not switched on yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Soon you&apos;ll be able to ask for a weekly plan, get topic explanations, and have weak chapters surfaced
            automatically from your own tracking data.
          </p>
        </div>
        <form className="flex gap-2 border-t border-border p-4" onSubmit={(e) => e.preventDefault()}>
          <Input placeholder="Ask anything about your syllabus…" disabled />
          <Button type="submit" disabled>
            Send
          </Button>
        </form>
      </div>
    </>
  );
}