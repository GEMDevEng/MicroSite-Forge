-- RLS Policies Migration
-- Generated on: 2025-09-26T11:34:24.713Z

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (for clean recreation)
DROP POLICY IF EXISTS "Users can view own users" ON users;
DROP POLICY IF EXISTS "Users can insert own users" ON users;
DROP POLICY IF EXISTS "Users can update own users" ON users;
DROP POLICY IF EXISTS "Users can delete own users" ON users;
DROP POLICY IF EXISTS "Users can view own sites" ON sites;
DROP POLICY IF EXISTS "Users can insert own sites" ON sites;
DROP POLICY IF EXISTS "Users can update own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete own sites" ON sites;
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
DROP POLICY IF EXISTS "Users can view own communications" ON communications;
DROP POLICY IF EXISTS "Users can insert own communications" ON communications;
DROP POLICY IF EXISTS "Users can update own communications" ON communications;
DROP POLICY IF EXISTS "Users can delete own communications" ON communications;
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

-- Create new RLS policies
-- Policy: Users can view own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can view own sites
CREATE POLICY "Users can view own sites" ON sites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert own sites
CREATE POLICY "Users can insert own sites" ON sites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own sites
CREATE POLICY "Users can update own sites" ON sites
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete own sites
CREATE POLICY "Users can delete own sites" ON sites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can view leads from own sites
CREATE POLICY "Users can view leads from own sites" ON leads
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

-- Policy: Users can insert leads for own sites
CREATE POLICY "Users can insert leads for own sites" ON leads
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

-- Policy: Users can update leads from own sites
CREATE POLICY "Users can update leads from own sites" ON leads
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

-- Policy: Users can delete leads from own sites
CREATE POLICY "Users can delete leads from own sites" ON leads
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

-- Policy: Users can view communications for own leads
CREATE POLICY "Users can view communications for own leads" ON communications
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()));

-- Policy: Users can insert communications for own leads
CREATE POLICY "Users can insert communications for own leads" ON communications
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()));

-- Policy: Users can update communications for own leads
CREATE POLICY "Users can update communications for own leads" ON communications
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()));

-- Policy: Users can view own jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert own jobs
CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own jobs
CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can view own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT
  USING (auth.uid() = user_id);
