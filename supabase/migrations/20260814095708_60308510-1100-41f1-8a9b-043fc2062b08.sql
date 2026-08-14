ALTER TABLE public.tracking_resources ADD COLUMN IF NOT EXISTS starred boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id, position);
CREATE INDEX IF NOT EXISTS idx_chapters_user_subject ON public.chapters(user_id, subject_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_user_chapter ON public.topics(user_id, chapter_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_user_subject ON public.topics(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date ON public.study_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_revision_items_user_due ON public.revision_items(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tracking_cells_user ON public.tracking_cells(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_daily_notes_user_date ON public.daily_notes(user_id, date);