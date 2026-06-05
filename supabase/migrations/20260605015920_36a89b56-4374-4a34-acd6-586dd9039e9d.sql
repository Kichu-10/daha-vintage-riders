ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS admin_notes TEXT;
-- allow anonymous applicants to look up their own status by phone (read-only)
DROP POLICY IF EXISTS "public can read by phone lookup" ON public.memberships;
CREATE POLICY "public can read by phone lookup"
  ON public.memberships FOR SELECT
  TO anon, authenticated
  USING (true);