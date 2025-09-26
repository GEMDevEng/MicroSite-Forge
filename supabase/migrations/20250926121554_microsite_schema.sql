-- Migration: MicroSite Database Schema
-- Generated on: 2025-09-26T12:15:54.481Z

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid NOT NULL,
  email text NOT NULL,
  stripe_id text,
  twilio_sid text,
  preferred_gateway text,
  gateway_credentials jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

-- Create indexes for users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_id ON users(stripe_id);


-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  domain text,
  status text,
  github_repo text,
  netlify_url text,
  leads_count bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- Create indexes for sites
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_domain ON sites(domain);
CREATE INDEX idx_sites_status ON sites(status);


-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  source text,
  status text,
  score_data jsonb,
  contact_info jsonb,
  tags jsonb,
  assigned_to text,
  follow_up_date timestamptz,
  marketing_campaign text,
  enriched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- Create indexes for leads
CREATE INDEX idx_leads_site_id ON leads(site_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_follow_up_date ON leads(follow_up_date);
CREATE INDEX idx_leads_created_at ON leads(created_at);


-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lead_id uuid NOT NULL,
  type text NOT NULL,
  direction text NOT NULL,
  content text NOT NULL,
  status text,
  message_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- Create indexes for communications
CREATE INDEX idx_communications_lead_id ON communications(lead_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_created_at ON communications(created_at);


-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  status text,
  data jsonb NOT NULL,
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- Create indexes for jobs
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);


-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  stripe_invoice_id text NOT NULL,
  amount numeric NOT NULL,
  currency text,
  status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- Create indexes for invoices
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE UNIQUE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own sites" ON sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sites" ON sites FOR INSERT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sites" ON sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sites" ON sites FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view leads from own sites" ON leads FOR SELECT USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));
CREATE POLICY "Users can insert leads for own sites" ON leads FOR INSERT USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));
CREATE POLICY "Users can update leads from own sites" ON leads FOR UPDATE USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));
CREATE POLICY "Users can delete leads from own sites" ON leads FOR DELETE USING (EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid()));
CREATE POLICY "Users can view communications for own leads" ON communications FOR SELECT USING (EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()));
CREATE POLICY "Users can insert communications for own leads" ON communications FOR INSERT USING (EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()));
CREATE POLICY "Users can update communications for own leads" ON communications FOR UPDATE USING (EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid()));
CREATE POLICY "Users can view own jobs" ON jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON jobs FOR INSERT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create analytical views
CREATE OR REPLACE VIEW user_sites_stats AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT s.id) as sites_count,
  COALESCE(SUM(s.leads_count), 0) as total_leads_count,
  COUNT(DISTINCT CASE WHEN s.status = 'live' THEN s.id END) as live_sites_count
FROM users u
LEFT JOIN sites s ON u.id = s.user_id
GROUP BY u.id, u.email;

-- Create utility functions
CREATE OR REPLACE FUNCTION get_user_total_leads(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(leads_count)
    FROM sites
    WHERE user_id = user_uuid
  ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
