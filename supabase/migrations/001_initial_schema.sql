-- TrulyTrue Consumer Trust Intelligence Platform Database Migration
-- Target Platform: Supabase / PostgreSQL (Self-Healing & Idempotent)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- STEP 1: CREATE SCAM CATEGORIES FIRST
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scam_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Categories
INSERT INTO public.scam_categories (name, description) VALUES
  ('Bank Fraud', 'Fake banking alerts, spoofed helpline numbers, and OTP harvesting'),
  ('UPI Scam', 'Fake payment requests, reverse transfers, VPA impersonation'),
  ('Phishing', 'Deceptive links capturing credentials, credit cards, or personal data'),
  ('Fake Customer Support', 'Impersonating official support channels or telecom services'),
  ('Investment Scam', 'High-return crypto pools, bogus stock tips, forex trading bots'),
  ('Crypto Scam', 'Fraudulent token presales, fake wallet drains, recovery scams'),
  ('Job Scam', 'Work-from-home tasks, video like rewards, advance fee job offers'),
  ('Lottery Scam', 'Fake prize claims, KBC rewards, customs fee demands'),
  ('Delivery Scam', 'Parcel hold notifications demanding address fee or redelivery cost'),
  ('Romance Scam', 'Manipulative personal relationships requesting financial transfer'),
  ('Identity Theft', 'Stolen PAN, Aadhaar, or impersonated social profiles'),
  ('Impersonation', 'Posing as law enforcement, government officials, or family'),
  ('Account Takeover', 'Unauthorized access to messaging apps, social, or email'),
  ('Digital Arrest', 'Threatening video calls claiming legal arrest unless paid immediately'),
  ('Malware', 'Sourced malicious APK downloads, trojans, or spyware links'),
  ('Refund Scam', 'False e-commerce or bill refunds requiring app remote access'),
  ('KYC Scam', 'Threats of SIM or bank block requiring unverified KYC links'),
  ('Loan Scam', 'Instant unapproved loan apps charging extortionate interest rates'),
  ('Marketplace Scam', 'Fake buyers/sellers on OLX, Quikr, or social marketplaces'),
  ('Social Media Scam', 'Hacked friend handles, fake giveaways, or automated DM spam'),
  ('Other', 'Uncategorized or emerging fraudulent activity')
ON CONFLICT (name) DO NOTHING;

--------------------------------------------------
-- STEP 2: PROFILES TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- STEP 3: SCAM REPORTS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('phone','url','email','upi','message','social_media','screenshot','other')),
  target_value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  title TEXT,
  description TEXT,
  scam_category TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'community_report' CHECK (status IN ('community_report','under_review','verified','disputed','removed')),
  country TEXT DEFAULT 'India',
  state TEXT,
  district TEXT,
  city TEXT,
  reporter_region TEXT,
  evidence_url TEXT,
  ai_category TEXT,
  ai_summary TEXT,
  ai_confidence NUMERIC,
  ai_risk_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- STEP 4: CHECKS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('text','screenshot','url','phone','email','upi','social_media')),
  input_value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  result JSONB,
  risk_score NUMERIC,
  ai_confidence NUMERIC,
  scam_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- STEP 5: EVIDENCE TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- STEP 6: INDEXES
--------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scam_reports_normalized ON public.scam_reports(normalized_value);
CREATE INDEX IF NOT EXISTS idx_scam_reports_target_type ON public.scam_reports(target_type);
CREATE INDEX IF NOT EXISTS idx_scam_reports_scam_category ON public.scam_reports(scam_category);
CREATE INDEX IF NOT EXISTS idx_scam_reports_geo ON public.scam_reports(country, state, district);
CREATE INDEX IF NOT EXISTS idx_scam_reports_created_at ON public.scam_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON public.scam_reports(status);

CREATE INDEX IF NOT EXISTS idx_checks_user_id ON public.checks(user_id);
CREATE INDEX IF NOT EXISTS idx_checks_normalized ON public.checks(normalized_value);

--------------------------------------------------
-- STEP 7: AGGREGATION VIEWS
--------------------------------------------------
CREATE OR REPLACE VIEW public.v_target_intelligence AS
SELECT 
  normalized_value,
  target_type,
  COUNT(*) AS total_community_reports,
  COUNT(*) FILTER (WHERE status = 'verified') AS verified_reports,
  MIN(created_at) AS first_reported,
  MAX(created_at) AS latest_reported,
  MODE() WITHIN GROUP (ORDER BY scam_category) AS most_reported_category,
  AVG(ai_risk_score) AS average_risk_score
FROM public.scam_reports
WHERE status != 'removed'
GROUP BY normalized_value, target_type;

CREATE OR REPLACE VIEW public.v_geographic_aggregates AS
SELECT 
  country,
  state,
  district,
  COUNT(*) AS total_reports,
  MODE() WITHIN GROUP (ORDER BY scam_category) AS top_scam_category,
  MAX(created_at) AS latest_report_at
FROM public.scam_reports
WHERE status != 'removed' AND country IS NOT NULL
GROUP BY country, state, district;

--------------------------------------------------
-- STEP 8: AUTOMATIC USER PROFILE TRIGGER
--------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------
-- STEP 9: ROW LEVEL SECURITY & POLICIES (SAFE DROP & CREATE)
--------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public scam categories read" ON public.scam_categories;
DROP POLICY IF EXISTS "Public scam reports read" ON public.scam_reports;
DROP POLICY IF EXISTS "Anyone insert scam report" ON public.scam_reports;
DROP POLICY IF EXISTS "Users view own checks" ON public.checks;
DROP POLICY IF EXISTS "Anyone insert check" ON public.checks;
DROP POLICY IF EXISTS "Public evidence read" ON public.evidence;
DROP POLICY IF EXISTS "Anyone insert evidence" ON public.evidence;

CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public scam categories read" ON public.scam_categories FOR SELECT USING (true);
CREATE POLICY "Public scam reports read" ON public.scam_reports FOR SELECT USING (status != 'removed');
CREATE POLICY "Anyone insert scam report" ON public.scam_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own checks" ON public.checks FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone insert check" ON public.checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public evidence read" ON public.evidence FOR SELECT USING (true);
CREATE POLICY "Anyone insert evidence" ON public.evidence FOR INSERT WITH CHECK (true);

--------------------------------------------------
-- STEP 10: STORAGE BUCKET & POLICIES
--------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public storage evidence view" ON storage.objects;
DROP POLICY IF EXISTS "Public storage evidence upload" ON storage.objects;

CREATE POLICY "Public storage evidence view" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "Public storage evidence upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence');
