# Study Compass

Build a complete, responsive, production-quality web application called StudyTracker — a personal academic operating system for students, combining a marketing landing page with a fully functional in-app study tracker (syllabus tracking, daily task tracking, spaced revision, calendar, analytics, and a placeholder AI assistant page).

1. Overall Concept

StudyTracker helps students — especially Indian competitive-exam students (JEE, NEET, CBSE/state board exams) but usable by any student in any exam system — plan their syllabus, track daily study tasks, automatically schedule spaced revision, and see their progress in one place. The tone is serious and professional like Notion or Todoist, but with an energetic, motivational, exam-prep edge. Visual style is a soft lo-fi, dark-aesthetic look that resonates with students who like cozy/focused study spaces.

2. Design System

Near-black background (#0a0a0c range), dark gray cards (#16161a / #1c1c22 range)

White/light-gray typography, soft off-white for body text (avoid pure white)

Accent palette: a warm lo-fi accent (muted amber/peach or soft purple — pick one primary accent and one secondary accent) used sparingly for CTAs and highlights

Status colors: green = completed, yellow/amber = in progress, red = not started/overdue, gray/blank outline = untouched

Subtle gradients and soft shadows on cards, moderate border radius (not overly rounded, not sharp)

Clean, modern sans-serif typography with clear hierarchy; slightly warmer/cozier type pairing to support the lo-fi feel (not sterile corporate SaaS)

Subtle grain/glow/ambient background touches allowed for the lo-fi feeling, but keep it subtle — this is a productivity tool first, not a gaming app

Smooth micro-animations on checkbox state changes, progress bars, card hovers, page transitions, and modals — never overdone

Fully responsive: desktop, tablet, and mobile with a proper mobile navigation pattern (bottom nav or slide-out drawer), not just a shrunk desktop layout

3. Site Structure

The project has two parts:

A. Public marketing site (multi-section landing page, no login required) B. Authenticated app (dashboard and tools, behind login)

A. Public Marketing Site — Sections

Build this as a proper multi-section landing page (not just one hero + footer):

Navbar — Logo/name "StudyTracker", links to on-page sections (Features, Syllabus Tracking, Revision, How It Works), and a "Log In" + "Get Started" button.

Hero Section — Strong, energetic headline built around taking control of syllabus, schedule, and exam prep (e.g., framing around JEE/NEET/board exam students wondering "what's pending, what's due, what's next"). Subheadline explaining StudyTracker as a personal academic command center. Primary CTA button "Get Started Free" (routes to signup) and secondary CTA "See How It Works" (scrolls down). Include an illustrative dashboard mockup graphic built directly in code (styled cards, mock progress donut chart, mock task list) — not a real screenshot, since none exist yet.

Social proof / motivational strip — A short energetic strip with stats-style callouts (e.g., framed generically like "Built for JEE, NEET, Boards & beyond" and "Track every subject, every chapter, every topic") — no fabricated user counts or testimonials since the product is new; keep this aspirational/feature-forward instead of fake social proof.

Core Features Section — Grid of feature cards, each with an icon and short description, covering: Custom Syllabus Tracking, Daily 360R Tracker, Automatic Spaced Revision Engine, Calendar & Consistency View, Analytics & Progress Insights, Personal AI Study Assistant (marked "Coming Soon").

Syllabus Tracking Deep-Dive Section — Dedicated section explaining hierarchical syllabus (Subject → Chapter → Topic, plus free-standing topics), with an illustrative mockup graphic (built in code) showing a subject card with chapters/topics and checkboxes in the blank → in-progress → completed states.

Daily 360R Section — Explain the daily tracker concept (lectures, question blocks, revision, custom tasks) with an illustrative mockup graphic showing a daily tracker table/grid with the checkbox states.

Revision Engine Section — Explain the automatic spaced-revision schedule (Day 1, 2, 3, 4, 7, 15, 39 style cadence) with an illustrative "today's revision" mockup card.

How It Works Section — Simple numbered step flow: Sign Up → Set Up Your Profile → Build Your Syllabus → Track Daily → Get Automatic Revisions → Watch Progress Grow.

Final CTA / Signup Section — A real signup form (Name + Email, and a "Start Free" button) that stores the submission in the Supabase database (see Section 7 below). Include a short reassuring line that it's free with no credit card required. Show a success state after submission (e.g., "You're on the list — log in below to get started" or direct them to sign up for a full account).

Footer — Logo/name, short tagline, simple links (Features, How It Works, Log In), and a copyright line.

B. Authenticated App

After login, users land in the app shell with a sidebar (desktop) / bottom nav or drawer (mobile) containing:

Dashboard
Syllabus
Daily 360R
Revision
Calendar
Analytics
Personal AI
Settings


Build each page as follows:

Onboarding (first login only)

After signup, ask for: Name, Class, Board, Stream, Exam (e.g., Class 11, CBSE, PCM, JEE). Store this on the user's profile. This selection does not need to auto-generate a real default syllabus in v1 — it's fine to save the profile info and let the user build their syllabus manually from an empty state with a clear "+ Add Subject" prompt.

Dashboard

Large donut/circular chart showing overall progress: Completed / In Progress / Not Started, with percentage in the center

Subject progress cards (subject name, percentage, completed/in-progress/remaining counts) — clicking a card navigates to that subject's syllabus

"Today's Summary" panel: today's tasks, completed vs pending, current streak, revisions due today

Empty states with clear guidance when no subjects/tasks exist yet (e.g., "Add your first subject to get started")

Syllabus Page

Hierarchical structure: Subjects → Chapters → Topics, plus a separate "Free Topics" section for topics not tied to any chapter

Full CRUD: add/rename/delete/reorder subjects, chapters, and topics

Each topic has a checkbox with a three-state cycle: blank (⬜) → in progress (🟡) → completed (🟢) → back to blank, with smooth animated transitions

Progress auto-calculates bottom-up: topic completion rolls up into chapter %, which rolls up into subject %, which rolls up into overall %— never manually entered

Support for custom tracking columns per subject/chapter/topic scope (e.g., "PYQ", "NCERT", "Module") that can be added, configured with a name/type/target, and scoped to an entire subject, selected chapters, or selected topics

Daily 360R Page

Date-based tracker (navigate between dates via date picker/arrows), with each date having its own saved record

Table/grid of tasks: Lectures, Question blocks (each block represents a configurable quantity, e.g., "Questions ×10"), Revision, and any custom tasks

Same three-state checkbox cycle as the syllabus page, plus a red "overdue" indicator state for tasks not completed by their due point

Daily targets (number of lectures, number of question blocks, questions per block) configurable in Settings and used as the default row set for each new day

Historical days remain saved and viewable

Revision Page

"Due Today" section listing all revisions due now (subject, topic, revision number)

"Upcoming" section for revisions due in the next several days

"Completed" section showing revision history

Filters by subject, chapter, topic

Automatic scheduling logic: whenever a topic is marked completed on the Syllabus or Daily 360R page, generate revision entries at Day 1, 2, 3, 4, 7, 15, and 39 from the completion date, each shown as a task the student marks complete

Revision consistency stat (percentage of due revisions actually completed) shown on this page

Calendar Page

Month view calendar where each day is color-coded: green (strong/completed day), yellow (partial), red (poor/missed), gray (future/no data)

Clicking a date opens a summary of that day's lectures, questions, revisions, and custom tasks (read view linking back to Daily 360R for that date)

Analytics Page

Overall syllabus completion chart (completed/in progress/remaining)

Per-subject progress comparison chart

Productivity stats: lectures completed, questions solved, revisions completed, daily consistency

Streak stats: current streak and longest streak

Use clean, readable charts (bar/line/donut as appropriate) with the dark theme applied consistently

Personal AI Page

Build this page as a clean chat-style interface UI (message list + input box) with a clear "Coming Soon" / "Connect your AI" banner at the top explaining that this will become a personalized assistant that reads the student's real syllabus, tasks, and revision data once connected

No live AI wiring needed for v1 — this is a placeholder page ready for a future AI integration, but it should look and feel finished, not broken or empty

Settings Page

Profile fields: Name, Class, Board, Stream, Exam

Default daily targets: number of lectures, number of question blocks, questions per block

Theme (dark is default/only option for v1, but include the toggle UI even if only dark is functional)

Account section with Logout

4. Authentication

Full email/password Sign Up, Login, and Logout using Supabase Auth

Each user's data (subjects, chapters, topics, tasks, revisions, etc.) must be strictly isolated to their own account

Enforce this with Supabase Row Level Security policies on every user-owned table, keyed on user_id

Redirect unauthenticated users away from app routes back to the marketing site's login page

After first signup, route the user into the onboarding flow described above before landing on the Dashboard

5. Database

Use Supabase (PostgreSQL) with Row Level Security enabled on every table. Suggested schema:

profiles — user_id, name, class, board, stream, exam, default_lecture_target, default_question_blocks, default_questions_per_block

subjects — id, user_id, name, order, archived

chapters — id, user_id, subject_id, name, order, archived

topics — id, user_id, chapter_id (nullable for free topics), subject_id, name, status (blank/in_progress/completed), order, archived

tracker_columns — id, user_id, name, type, target, unit

tracker_column_scopes — id, tracker_column_id, subject_id (nullable), chapter_id (nullable), topic_id (nullable)

daily_tasks — id, user_id, date, task_type (lecture/question_block/revision/custom), label, target_quantity

daily_task_status — id, daily_task_id, status (blank/in_progress/completed), completed_quantity

revision_items — id, user_id, topic_id, revision_number, due_date, status

revision_history — id, revision_item_id, completed_at

waitlist_signups — id, name, email, created_at (populated by the public landing page signup form, separate from real user accounts)

Every student-owned table must include user_id and have RLS policies restricting access to that user's own rows only.

6. Progress Calculation Logic

Progress must always be calculated, never manually entered:

Chapter % = completed topics ÷ total topics in that chapter

Subject % = aggregate of its chapters/topics

Overall % = aggregate across all subjects

Recalculate and reflect updates instantly (optimistic UI updates on checkbox clicks) whenever a topic or task status changes

7. Landing Page Signup Form

The signup form in the final CTA section (Name + Email) should insert a row into the waitlist_signups Supabase table on submit — no email-sending integration for now, just reliable storage. Show a clear success confirmation in the UI after a successful submission, and a clear error state if the insert fails. This form is separate from the real Sign Up flow used to create an actual account — make it clear in the copy that this is quick interest capture, and that the "Get Started" buttons elsewhere on the page lead to the actual account signup.

8. Tech Stack

Next.js + React + Tailwind CSS

Lucide React for icons

Recharts for charts

Framer Motion for animations

Supabase (PostgreSQL + Supabase Auth + Row Level Security) for backend and database

Keep everything on free tiers — no paid services required for any core functionality

9. Build Priority

Build in this order so the core is solid before polish:

Marketing landing page (all sections above)

Auth (signup/login/logout) + onboarding

Syllabus engine (subjects/chapters/topics/free topics + custom columns)

Daily 360R tracker

Revision engine (automatic scheduling + Revision page)

Dashboard

Calendar

Analytics

Personal AI placeholder page

Settings

Do not sacrifice the reliability of the core tracker (syllabus, daily tasks, revision scheduling, and progress calculation) for visual polish — the app must reliably store and reflect real academic progress before anything else.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://study-planner-in.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/91a02541-7e98-4890-a5bc-37fcce3e9a86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
