import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  LineChart,
  ListChecks,
  Loader2,
  Menu,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyMock, DashboardMock, RevisionMock, SyllabusMock } from "@/components/landing/Mockups";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyTracker — Syllabus, daily tasks & spaced revision" },
      {
        name: "description",
        content:
          "StudyTracker is a personal academic operating system for JEE, NEET and board exam students: syllabus tracking, daily 360R tasks, automatic spaced revision and analytics.",
      },
      { property: "og:title", content: "StudyTracker — Your academic command center" },
      {
        property: "og:description",
        content: "Know what's pending, what's due and what's next — every subject, chapter and topic in one place.",
      },
    ],
  }),
  component: Landing,
});

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Syllabus Tracking", href: "#syllabus" },
  { label: "Revision", href: "#revision" },
  { label: "How It Works", href: "#how-it-works" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-warm text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold">StudyTracker</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth" search={{ mode: "login" }}>
              Log In
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth" search={{ mode: "signup" }}>
              Get Started
            </Link>
          </Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to="/auth" search={{ mode: "login" }}>
                Log In
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-24">
      {(eyebrow || title) && (
        <div className="mb-10 max-w-2xl">
          {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
          {title && <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function Hero() {
  return (
    <div id="top" className="ambient grain relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Built for JEE, NEET &amp; Boards
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            Stop guessing what&apos;s pending.
            <br />
            <span className="text-gradient-warm">Own your syllabus.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            StudyTracker is your personal academic command center — every subject, chapter and topic tracked, every day
            planned, and every revision scheduled automatically so nothing slips before the exam.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get Started Free <ChevronRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
          <DashboardMock />
        </motion.div>
      </div>
    </div>
  );
}

function Strip() {
  const items = [
    "Built for JEE, NEET, Boards & beyond",
    "Track every subject, chapter & topic",
    "Day 1 → 30 spaced revision, automatic",
    "Free to start. No credit card.",
  ];
  return (
    <div className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-px px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => (
          <div key={t} className="flex items-start gap-2 px-2 py-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: ListChecks,
    title: "Custom Syllabus Tracking",
    desc: "Build Subject → Chapter → Topic hierarchies, plus free-standing topics, exactly how your course actually looks.",
  },
  {
    icon: CheckCircle2,
    title: "Daily 360R Tracker",
    desc: "Lectures, question blocks, revision and custom tasks — one saved record for every single day.",
  },
  {
    icon: RefreshCw,
    title: "Automatic Spaced Revision",
    desc: "Finish a topic and revisions appear at Day 1, 2, 3, 5, 7, 15 and 30. You never schedule them yourself.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Consistency",
    desc: "A month view colour-coded by how strong each day was, so streaks and slumps are impossible to hide from.",
  },
  {
    icon: LineChart,
    title: "Analytics & Insights",
    desc: "Completion charts, subject comparisons, lectures, questions solved, streaks — progress you can actually read.",
  },
  {
    icon: Sparkles,
    title: "Personal AI Assistant",
    desc: "An assistant that will read your real syllabus and plan your week.",
    soon: true,
  },
];

function Features() {
  return (
    <Section id="features" eyebrow="Core features" title="Everything your prep needs, nothing it doesn't">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            {...fadeUp}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="card-lofi group p-5 transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/12 text-primary">
              <f.icon className="size-5" />
            </span>
            <div className="mb-1.5 flex items-center gap-2">
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              {f.soon && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                  Coming Soon
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function SplitSection({
  id,
  eyebrow,
  title,
  points,
  mock,
  reverse,
}: {
  id: string;
  eyebrow: string;
  title: string;
  points: string[];
  mock: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <Section id={id}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div {...fadeUp} className={reverse ? "lg:order-2" : undefined}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }}>
          {mock}
        </motion.div>
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    ["Sign Up", "Create a free account in seconds."],
    ["Set Up Your Profile", "Class, board, stream and target exam."],
    ["Build Your Syllabus", "Add subjects, chapters and topics your way."],
    ["Track Daily", "Tick off lectures, questions and revision."],
    ["Get Auto Revisions", "The engine schedules Day 1 → 30 for you."],
    ["Watch Progress Grow", "Charts, streaks and completion, always live."],
  ];
  return (
    <Section id="how-it-works" eyebrow="How it works" title="Six steps from chaos to a plan">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(([title, desc], i) => (
          <motion.div key={title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.05 }} className="card-lofi p-5">
            <span className="font-display text-3xl font-semibold text-primary/35">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-2 font-display text-base font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function SignupCTA() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setState("loading");
    const { error } = await supabase.from("waitlist_signups").insert({ name: name.trim(), email: email.trim() });
    if (error) {
      setError(error.message);
      setState("error");
      return;
    }
    setState("done");
  }

  return (
    <Section id="start">
      <div className="card-lofi ambient overflow-hidden p-8 text-center sm:p-12">
        <h2 className="text-3xl font-semibold sm:text-4xl">Take control of your prep today</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Drop your details for quick updates — it takes five seconds. Ready to actually start tracking? Use{" "}
          <Link to="/auth" search={{ mode: "signup" }} className="text-primary underline-offset-4 hover:underline">
            Get Started
          </Link>{" "}
          to create your real account.
        </p>

        {state === "done" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-8 max-w-md rounded-xl border border-success/40 bg-success/10 p-6"
          >
            <CheckCircle2 className="mx-auto mb-2 size-6 text-success" />
            <p className="font-medium">You&apos;re on the list, {name.split(" ")[0]}!</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your account below to start tracking right away.</p>
            <Button asChild className="mt-4">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create my account
              </Link>
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={state === "loading"}>
              {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Start Free"}
            </Button>
          </form>
        )}
        {state === "error" && <p className="mt-3 text-sm text-destructive">Couldn&apos;t save that — {error}</p>}
        <p className="mt-4 text-xs text-muted-foreground">Free to start · No credit card required</p>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-warm text-primary-foreground">
              <BookOpen className="size-3.5" />
            </span>
            <span className="font-display font-semibold">StudyTracker</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Your personal academic operating system.</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground">
            How It Works
          </a>
          <Link to="/auth" search={{ mode: "login" }} className="hover:text-foreground">
            Log In
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} StudyTracker. Built for students who are done winging it.
      </p>
    </footer>
  );
}

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Strip />
      <Features />
      <SplitSection
        id="syllabus"
        eyebrow="Syllabus tracking"
        title="Your whole syllabus, down to the topic"
        points={[
          "Subjects hold chapters, chapters hold topics — and free-standing topics live alongside them when a chapter doesn't fit.",
          "One tap cycles a topic: blank → in progress → completed, with the state saved instantly.",
          "Progress rolls up automatically: topics feed chapters, chapters feed subjects, subjects feed your overall percentage.",
          "Add custom tracking columns like PYQ, NCERT or Module and scope them to a subject, some chapters or single topics.",
        ]}
        mock={<SyllabusMock />}
      />
      <SplitSection
        id="daily"
        eyebrow="Daily 360R"
        title="One honest record for every study day"
        reverse
        points={[
          "Set daily targets once — lectures, question blocks and questions per block — and every new day starts pre-filled.",
          "Track lectures, question blocks, revision and any custom task in a single grid.",
          "Anything left undone turns red so overdue work is obvious, not forgotten.",
          "Move between dates freely; every past day stays saved and viewable.",
        ]}
        mock={<DailyMock />}
      />
      <SplitSection
        id="revision"
        eyebrow="Revision engine"
        title="Revision that schedules itself"
        points={[
          "Mark a topic complete and the engine creates seven revisions at Day 1, 2, 3, 5, 7, 15 and 30.",
          "See what's due today, what's coming up and everything you've already revised.",
          "Filter by subject, chapter or topic when you want to drill into one area.",
          "A revision consistency score keeps you honest about the reviews you actually did.",
        ]}
        mock={<RevisionMock />}
      />
      <HowItWorks />
      <SignupCTA />
      <Footer />
    </main>
  );
}
