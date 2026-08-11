ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS status topic_status NOT NULL DEFAULT 'blank';

CREATE TABLE IF NOT EXISTS public.daily_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_notes TO authenticated;
GRANT ALL ON public.daily_notes TO service_role;
ALTER TABLE public.daily_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily notes" ON public.daily_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.study_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  lecture_number integer NOT NULL DEFAULT 1,
  lecture_name text,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  topic_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS study_logs_user_date_idx ON public.study_logs (user_id, date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_logs TO authenticated;
GRANT ALL ON public.study_logs TO service_role;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own study logs" ON public.study_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.r360_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'custom',
  label text NOT NULL,
  block_count integer NOT NULL DEFAULT 1,
  per_block integer NOT NULL DEFAULT 1,
  unit text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.r360_items TO authenticated;
GRANT ALL ON public.r360_items TO service_role;
ALTER TABLE public.r360_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own r360 items" ON public.r360_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.tracking_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_resources TO authenticated;
GRANT ALL ON public.tracking_resources TO service_role;
ALTER TABLE public.tracking_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tracking resources" ON public.tracking_resources FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.tracking_cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.tracking_resources(id) ON DELETE CASCADE,
  status topic_status NOT NULL DEFAULT 'blank',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, resource_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_cells TO authenticated;
GRANT ALL ON public.tracking_cells TO service_role;
ALTER TABLE public.tracking_cells ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tracking cells" ON public.tracking_cells FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;

CREATE TRIGGER update_daily_notes_updated_at BEFORE UPDATE ON public.daily_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_r360_items_updated_at BEFORE UPDATE ON public.r360_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tracking_cells_updated_at BEFORE UPDATE ON public.tracking_cells
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS r360_item_id uuid REFERENCES public.r360_items(id) ON DELETE SET NULL;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS block_index integer NOT NULL DEFAULT 0;