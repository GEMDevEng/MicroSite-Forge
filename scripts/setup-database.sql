-- MicroSite Forge Database Schema Setup Script
-- This script creates all necessary tables for Phase 1

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  stripe_id text,
  twilio_sid text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sites table
create table public.sites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  domain text,
  status text check (status in ('pending', 'live', 'error')) default 'pending',
  github_repo text,
  netlify_url text,
  leads_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leads table (enhanced for Phase 3)
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text,
  message text,
  source text default 'website',
  status text check (status in ('new', 'qualified', 'contacted', 'converted')) default 'new',
  score_data jsonb,
  contact_info jsonb,
  tags jsonb,
  assigned_to uuid,
  follow_up_date timestamp with time zone,
  marketing_campaign text,
  enriched_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Jobs table (for background processing)
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,
  status text check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  data jsonb not null,
  result jsonb,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices table
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_invoice_id text not null unique,
  amount integer not null, -- in cents
  currency text default 'usd',
  status text check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null
);

-- Create indexes for performance
create index sites_user_id_idx on public.sites(user_id);
create index sites_status_idx on public.sites(status);
create index sites_created_at_idx on public.sites(created_at desc);
create index leads_site_id_idx on public.leads(site_id);
create index leads_status_idx on public.leads(status);
create index leads_created_at_idx on public.leads(created_at desc);
create index leads_email_idx on public.leads(email);
create index jobs_user_id_idx on public.jobs(user_id);
create index jobs_status_idx on public.jobs(status);
create index jobs_type_idx on public.jobs(type);
create index jobs_created_at_idx on public.jobs(created_at desc);
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_stripe_id_idx on public.invoices(stripe_invoice_id);
create index invoices_status_idx on public.invoices(status);

-- Row Level Security (RLS) Policies

-- Users table policies
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Sites table policies
alter table public.sites enable row level security;
create policy "Users can view own sites" on public.sites for select using (auth.uid() = user_id);
create policy "Users can create own sites" on public.sites for insert with check (auth.uid() = user_id);
create policy "Users can update own sites" on public.sites for update using (auth.uid() = user_id);
create policy "Users can delete own sites" on public.sites for delete using (auth.uid() = user_id);

-- Leads table policies
alter table public.leads enable row level security;
create policy "Users can view leads from their sites" on public.leads for select using (
  auth.uid() in (
    select user_id from public.sites where id = leads.site_id
  )
);
create policy "Users can create leads for their sites" on public.leads for insert with check (
  auth.uid() in (
    select user_id from public.sites where id = leads.site_id
  )
);
create policy "Users can update leads from their sites" on public.leads for update using (
  auth.uid() in (
    select user_id from public.sites where id = leads.site_id
  )
);

-- Jobs table policies
alter table public.jobs enable row level security;
create policy "Users can view own jobs" on public.jobs for select using (auth.uid() = user_id);
create policy "Users can create own jobs" on public.jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own jobs" on public.jobs for update using (auth.uid() = user_id);

-- Invoices table policies
alter table public.invoices enable row level security;
create policy "Users can view own invoices" on public.invoices for select using (auth.uid() = user_id);
create policy "Users can create own invoices" on public.invoices for insert with check (auth.uid() = user_id);

-- Triggers for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language 'plpgsql';

-- Apply triggers to all tables
create trigger update_users_updated_at before update on public.users for each row execute procedure update_updated_at_column();
create trigger update_sites_updated_at before update on public.sites for each row execute procedure update_updated_at_column();
create trigger update_leads_updated_at before update on public.leads for each row execute procedure update_updated_at_column();
create trigger update_jobs_updated_at before update on public.jobs for each row execute procedure update_updated_at_column();
create trigger update_invoices_updated_at before update on public.invoices for each row execute procedure update_updated_at_column();

-- Trigger to update leads_count when leads are inserted/updated/deleted
create or replace function update_sites_leads_count()
returns trigger as $$
begin
    if tg_op = 'INSERT' then
        update public.sites set leads_count = leads_count + 1 where id = new.site_id;
        return new;
    elsif tg_op = 'DELETE' then
        update public.sites set leads_count = leads_count - 1 where id = old.site_id;
        return old;
    end if;
    return null;
end;
$$ language 'plpgsql';

create trigger update_sites_leads_count_insert after insert on public.leads for each row execute procedure update_sites_leads_count();
create trigger update_sites_leads_count_delete after delete on public.leads for each row execute procedure update_sites_leads_count();

-- Function to get user's total leads count
create or replace function get_user_total_leads(user_uuid uuid)
returns integer as $$
begin
    return (
        select coalesce(sum(leads_count), 0)::integer
        from public.sites
        where user_id = user_uuid
    );
end;
$$ language 'plpgsql' security definer;

-- Views for analytics
create view public.user_sites_stats as
select
    u.id as user_id,
    u.email,
    count(s.id) as sites_count,
    sum(s.leads_count) as total_leads_count,
    count(case when s.status = 'live' then 1 end) as live_sites_count
from public.users u
left join public.sites s on u.id = s.user_id
group by u.id, u.email;

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.users to anon, authenticated;
grant all on public.sites to anon, authenticated;
grant all on public.leads to anon, authenticated;
grant all on public.jobs to anon, authenticated;
grant all on public.invoices to anon, authenticated;
grant select on public.user_sites_stats to anon, authenticated;
