-- Migration: MicroSite Database Schema
-- Consolidated migration for initial setup

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid NOT NULL,
  email text NOT NULL,
  stripe_id text,
  twilio_sid text,
  preferred_gateway text,
  gateway_credentials jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_id ON users(stripe_id);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  domain text,
  status text,
  github_repo text,
  netlify_url text,
  leads_count bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sites_pkey PRIMARY KEY (id),
  CONSTRAINT sites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for sites
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  status text,
  score_data jsonb,
  contact_info jsonb,
  assigned_to uuid,
  follow_up_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_site_id_fkey FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_site_id ON leads(site_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_date ON leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  type text NOT NULL,
  content text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT communications_pkey PRIMARY KEY (id),
  CONSTRAINT communications_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Create indexes for communications
CREATE INDEX IF NOT EXISTS idx_communications_lead_id ON communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  payload jsonb,
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_id text,
  amount bigint NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (for clean recreation)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own sites" ON sites;
DROP POLICY IF EXISTS "Users can insert own sites" ON sites;
DROP POLICY IF EXISTS "Users can update own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete own sites" ON sites;
DROP POLICY IF EXISTS "Users can view leads from own sites" ON leads;
DROP POLICY IF EXISTS "Users can insert leads for own sites" ON leads;
DROP POLICY IF EXISTS "Users can update leads from own sites" ON leads;
DROP POLICY IF EXISTS "Users can delete leads from own sites" ON leads;
DROP POLICY IF EXISTS "Users can view communications from own leads" ON communications;
DROP POLICY IF EXISTS "Users can insert communications from own leads" ON communications;
DROP POLICY IF EXISTS "Users can update communications from own leads" ON communications;
DROP POLICY IF EXISTS "Users can delete communications from own leads" ON communications;
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for sites
CREATE POLICY "Users can view own sites" ON sites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites" ON sites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites" ON sites
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites" ON sites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for leads
CREATE POLICY "Users can view leads from own sites" ON leads
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

CREATE POLICY "Users can insert leads for own sites" ON leads
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

CREATE POLICY "Users can update leads from own sites" ON leads
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

CREATE POLICY "Users can delete leads from own sites" ON leads
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));

-- Create RLS policies for communications
CREATE POLICY "Users can view communications from own leads" ON communications
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM leads 
    JOIN sites ON sites.id = leads.site_id 
    WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert communications from own leads" ON communications
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM leads 
    JOIN sites ON sites.id = leads.site_id 
    WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()
  ));

CREATE POLICY "Users can update communications from own leads" ON communications
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM leads 
    JOIN sites ON sites.id = leads.site_id 
    WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete communications from own leads" ON communications
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM leads 
    JOIN sites ON sites.id = leads.site_id 
    WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()
  ));

-- Create RLS policies for jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE
  USING (auth.uid() = user_id);

