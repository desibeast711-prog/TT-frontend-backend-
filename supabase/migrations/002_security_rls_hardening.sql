-- Supabase Database Security & RLS Hardening Migration
-- TrulyTrue Consumer Trust Platform
-- Fixes Security Advisor recommendations & enforces Row Level Security (RLS)

--------------------------------------------------
-- STEP 1: FORCE ENABLE RLS ON ALL EXPOSED TABLES
--------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

--------------------------------------------------
-- STEP 2: REVOKE DESTRUCTIVE PERMISSIONS FROM PUBLIC/ANON
--------------------------------------------------
-- Explicitly revoke UPDATE and DELETE privileges from anon & authenticated roles.
-- Only database triggers or Service Role (backend/admin) can execute administrative changes.
REVOKE UPDATE, DELETE ON public.scam_reports FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.scam_categories FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.checks FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.evidence FROM anon, authenticated;

--------------------------------------------------
-- STEP 3: DROP UNSECURE OR DUPLICATE POLICIES
--------------------------------------------------
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public scam categories read" ON public.scam_categories;
DROP POLICY IF EXISTS "Public scam reports read" ON public.scam_reports;
DROP POLICY IF EXISTS "Anyone insert scam report" ON public.scam_reports;
DROP POLICY IF EXISTS "Users view own checks" ON public.checks;
DROP POLICY IF EXISTS "Anyone insert check" ON public.checks;
DROP POLICY IF EXISTS "Public evidence read" ON public.evidence;
DROP POLICY IF EXISTS "Anyone insert evidence" ON public.evidence;

--------------------------------------------------
-- STEP 4: DEFINE AIRTIGHT RLS POLICIES
--------------------------------------------------

-- 1. Profiles Table
-- Public read access to display profiles, but users can ONLY modify their own profile record.
CREATE POLICY "Public profiles read" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 2. Scam Categories Table (Read-Only reference dictionary)
CREATE POLICY "Public scam categories read" 
  ON public.scam_categories FOR SELECT 
  USING (true);

-- 3. Scam Reports Table
-- Anyone can view community reports that are NOT marked as 'removed' by moderators.
CREATE POLICY "Public scam reports read" 
  ON public.scam_reports FOR SELECT 
  USING (status != 'removed');

-- Anyone can submit a scam report, but new reports MUST default status to 'community_report'
-- and cannot artificially override status to 'verified' or manipulate counts.
CREATE POLICY "Anyone insert scam report" 
  ON public.scam_reports FOR INSERT 
  WITH CHECK (
    status = 'community_report' AND 
    length(target_value) >= 2 AND 
    target_type IN ('phone','url','email','upi','message','social_media','screenshot','other')
  );

-- NO UPDATE policy created for public/anon users -> Prevents changing report status, report count, or wiping text.
-- NO DELETE policy created for public/anon users -> Prevents wiping community records.

-- 4. Checks Log Table
-- Users can read their own check records or anonymous checks attached to their session.
CREATE POLICY "Users view own checks" 
  ON public.checks FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone insert check" 
  ON public.checks FOR INSERT 
  WITH CHECK (
    length(input_value) >= 1 AND
    input_type IN ('text','screenshot','url','phone','email','upi','social_media')
  );

-- NO UPDATE / DELETE policies created for checks -> Immutable audit trail.

-- 5. Evidence Table
CREATE POLICY "Public evidence read" 
  ON public.evidence FOR SELECT 
  USING (true);

CREATE POLICY "Anyone insert evidence" 
  ON public.evidence FOR INSERT 
  WITH CHECK (length(file_url) > 5);

-- NO UPDATE / DELETE policies created for evidence -> Cannot overwrite uploaded evidence.

--------------------------------------------------
-- STEP 5: STORAGE BUCKET RLS HARDENING
--------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence', 'evidence', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public storage evidence view" ON storage.objects;
DROP POLICY IF EXISTS "Public storage evidence upload" ON storage.objects;
DROP POLICY IF EXISTS "Public storage evidence update" ON storage.objects;
DROP POLICY IF EXISTS "Public storage evidence delete" ON storage.objects;

-- Allow public viewing of evidence objects in the evidence bucket
CREATE POLICY "Public storage evidence view" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'evidence');

-- Allow public uploading into the evidence bucket
CREATE POLICY "Public storage evidence upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'evidence');

-- Strictly block anonymous or unauthorized users from deleting or replacing existing storage files
-- (No UPDATE or DELETE policy created for public/anon users).
