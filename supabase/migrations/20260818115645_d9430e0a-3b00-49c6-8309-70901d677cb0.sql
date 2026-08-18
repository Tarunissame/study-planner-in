REVOKE SELECT, UPDATE, DELETE, REFERENCES, TRIGGER, TRUNCATE ON public.waitlist_signups FROM anon, authenticated;
GRANT INSERT ON public.waitlist_signups TO anon, authenticated;
GRANT ALL ON public.waitlist_signups TO service_role;
DROP POLICY IF EXISTS "no public read of waitlist" ON public.waitlist_signups;
CREATE POLICY "no public read of waitlist" ON public.waitlist_signups FOR SELECT TO anon, authenticated USING (false);