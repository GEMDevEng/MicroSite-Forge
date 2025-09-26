# MicroSite Supabase Schema Automation - Coding Agent Instructions

## 🎯 MISSION
You are tasked with automating the creation and management of a complete MicroSite database schema in Supabase using CLI tools. This schema includes users, sites, leads, communications, jobs, and invoices tables with proper relationships, RLS policies, views, and functions.

## 📋 EXECUTION CHECKLIST

### Phase 1: Environment Setup
- [ ] Verify VS Code is open in the project directory
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Initialize project: `supabase init`
- [ ] Login to Supabase: `supabase login`
- [ ] Start local development: `supabase start`

### Phase 2: Schema Files Creation
Create these exact files in your project structure:

#### 1. Create `schemas/tables.json`
```json
{
  "users": {
    "columns": {
      "id": {
        "type": "uuid",
        "primary_key": true,
        "not_null": true,
        "references": "auth.users(id)"
      },
      "email": {
        "type": "text",
        "not_null": true
      },
      "stripe_id": {
        "type": "text",
        "nullable": true
      },
      "twilio_sid": {
        "type": "text",
        "nullable": true
      },
      "preferred_gateway": {
        "type": "text",
        "nullable": true
      },
      "gateway_credentials": {
        "type": "jsonb",
        "nullable": true
      },
      "created_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      },
      "updated_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      }
    },
    "indexes": [
      "CREATE INDEX idx_leads_site_id ON leads(site_id)",
      "CREATE INDEX idx_leads_email ON leads(email)",
      "CREATE INDEX idx_leads_status ON leads(status)",
      "CREATE INDEX idx_leads_assigned_to ON leads(assigned_to)",
      "CREATE INDEX idx_leads_follow_up_date ON leads(follow_up_date)",
      "CREATE INDEX idx_leads_created_at ON leads(created_at)"
    ]
  },
  "communications": {
    "columns": {
      "id": {
        "type": "uuid",
        "primary_key": true,
        "not_null": true,
        "default": "uuid_generate_v4()"
      },
      "lead_id": {
        "type": "uuid",
        "not_null": true,
        "references": "leads(id)"
      },
      "type": {
        "type": "text",
        "not_null": true,
        "check": "type IN ('email', 'sms', 'call', 'note')"
      },
      "direction": {
        "type": "text",
        "not_null": true,
        "check": "direction IN ('inbound', 'outbound')"
      },
      "content": {
        "type": "text",
        "not_null": true
      },
      "status": {
        "type": "text",
        "nullable": true
      },
      "message_id": {
        "type": "text",
        "nullable": true
      },
      "metadata": {
        "type": "jsonb",
        "nullable": true
      },
      "created_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      }
    },
    "indexes": [
      "CREATE INDEX idx_communications_lead_id ON communications(lead_id)",
      "CREATE INDEX idx_communications_type ON communications(type)",
      "CREATE INDEX idx_communications_created_at ON communications(created_at)"
    ]
  },
  "jobs": {
    "columns": {
      "id": {
        "type": "uuid",
        "primary_key": true,
        "not_null": true,
        "default": "uuid_generate_v4()"
      },
      "user_id": {
        "type": "uuid",
        "not_null": true,
        "references": "users(id)"
      },
      "type": {
        "type": "text",
        "not_null": true
      },
      "status": {
        "type": "text",
        "nullable": true
      },
      "data": {
        "type": "jsonb",
        "not_null": true
      },
      "result": {
        "type": "jsonb",
        "nullable": true
      },
      "error": {
        "type": "text",
        "nullable": true
      },
      "created_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      },
      "updated_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      }
    },
    "indexes": [
      "CREATE INDEX idx_jobs_user_id ON jobs(user_id)",
      "CREATE INDEX idx_jobs_status ON jobs(status)",
      "CREATE INDEX idx_jobs_type ON jobs(type)",
      "CREATE INDEX idx_jobs_created_at ON jobs(created_at)"
    ]
  },
  "invoices": {
    "columns": {
      "id": {
        "type": "uuid",
        "primary_key": true,
        "not_null": true,
        "default": "uuid_generate_v4()"
      },
      "user_id": {
        "type": "uuid",
        "not_null": true,
        "references": "users(id)"
      },
      "stripe_invoice_id": {
        "type": "text",
        "not_null": true
      },
      "amount": {
        "type": "numeric",
        "not_null": true
      },
      "currency": {
        "type": "text",
        "nullable": true
      },
      "status": {
        "type": "text",
        "nullable": true
      },
      "created_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      },
      "updated_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      }
    },
    "indexes": [
      "CREATE INDEX idx_invoices_user_id ON invoices(user_id)",
      "CREATE UNIQUE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id)",
      "CREATE INDEX idx_invoices_status ON invoices(status)"
    ]
  }
}
```

#### 2. Create `schemas/policies.json`
```json
{
  "users": [
    {
      "name": "Users can view own profile",
      "action": "SELECT",
      "condition": "auth.uid() = id"
    },
    {
      "name": "Users can update own profile",
      "action": "UPDATE", 
      "condition": "auth.uid() = id"
    }
  ],
  "sites": [
    {
      "name": "Users can view own sites",
      "action": "SELECT",
      "condition": "auth.uid() = user_id"
    },
    {
      "name": "Users can insert own sites",
      "action": "INSERT",
      "condition": "auth.uid() = user_id"
    },
    {
      "name": "Users can update own sites",
      "action": "UPDATE",
      "condition": "auth.uid() = user_id"
    },
    {
      "name": "Users can delete own sites",
      "action": "DELETE",
      "condition": "auth.uid() = user_id"
    }
  ],
  "leads": [
    {
      "name": "Users can view leads from own sites",
      "action": "SELECT",
      "condition": "EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid())"
    },
    {
      "name": "Users can insert leads for own sites",
      "action": "INSERT",
      "condition": "EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid())"
    },
    {
      "name": "Users can update leads from own sites",
      "action": "UPDATE",
      "condition": "EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid())"
    },
    {
      "name": "Users can delete leads from own sites",
      "action": "DELETE",
      "condition": "EXISTS (SELECT 1 FROM sites WHERE sites.id = leads.site_id AND sites.user_id = auth.uid())"
    }
  ],
  "communications": [
    {
      "name": "Users can view communications for own leads",
      "action": "SELECT",
      "condition": "EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid())"
    },
    {
      "name": "Users can insert communications for own leads",
      "action": "INSERT",
      "condition": "EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid())"
    },
    {
      "name": "Users can update communications for own leads",
      "action": "UPDATE",
      "condition": "EXISTS (SELECT 1 FROM leads JOIN sites ON leads.site_id = sites.id WHERE leads.id = communications.lead_id AND sites.user_id = auth.uid())"
    }
  ],
  "jobs": [
    {
      "name": "Users can view own jobs",
      "action": "SELECT",
      "condition": "auth.uid() = user_id"
    },
    {
      "name": "Users can insert own jobs",
      "action": "INSERT",
      "condition": "auth.uid() = user_id"
    },
    {
      "name": "Users can update own jobs",
      "action": "UPDATE",
      "condition": "auth.uid() = user_id"
    }
  ],
  "invoices": [
    {
      "name": "Users can view own invoices",
      "action": "SELECT",
      "condition": "auth.uid() = user_id"
    }
  ]
}
```

#### 3. Create `supabase/seed.sql` (Sample Data)
```sql
-- Sample seed data for MicroSite schema
INSERT INTO users (id, email, stripe_id, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'john@example.com', 'cus_123456', now()),
  ('550e8400-e29b-41d4-a716-446655440001', 'jane@example.com', 'cus_789012', now());

INSERT INTO sites (id, user_id, name, domain, status, leads_count) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Tech Startup Landing', 'techstartup.com', 'live', 25),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'E-commerce Store', 'mystore.com', 'live', 42);

INSERT INTO leads (id, site_id, name, email, phone, message, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Alice Johnson', 'alice@email.com', '+1234567890', 'Interested in your services', 'new'),
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Bob Smith', 'bob@email.com', '+0987654321', 'Need more information', 'contacted');

INSERT INTO communications (id, lead_id, type, direction, content) VALUES
  ('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'email', 'outbound', 'Thank you for your interest!'),
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'sms', 'outbound', 'Hi Bob, here is the information you requested.');

INSERT INTO jobs (id, user_id, type, status, data) VALUES
  ('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'lead_enrichment', 'completed', '{"lead_id": "770e8400-e29b-41d4-a716-446655440000"}'),
  ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'email_campaign', 'pending', '{"campaign_id": "camp_001"}');

INSERT INTO invoices (id, user_id, stripe_invoice_id, amount, currency, status) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'in_123456789', 29.99, 'usd', 'paid'),
  ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'in_987654321', 49.99, 'usd', 'pending');
```

### Phase 3: Automation Scripts Setup
Copy all the automation scripts from the main SOP document. The key scripts you need:

- [ ] `scripts/generate-migration.js` (Enhanced version from SOP)
- [ ] `scripts/generate-rls.js`
- [ ] `scripts/deploy-schema.js`
- [ ] `scripts/automated-schema-builder.js`

### Phase 4: VS Code Integration
- [ ] Create `.vscode/tasks.json` with the tasks from the SOP
- [ ] Create `package.json` with the MicroSite-specific scripts

### Phase 5: Execution Commands

#### Quick Start Commands (Execute in order):
```bash
# 1. Build complete schema
npm run db:build

# 2. Verify local Supabase is running
supabase status

# 3. Generate TypeScript types
npm run db:types

# 4. Open Supabase Studio
npm run db:studio
```

#### Individual Commands (for debugging):
```bash
# Generate migration files only
npm run db:generate

# Generate RLS policies only
npm run db:generate:rls

# Deploy to local environment
npm run db:deploy:local

# Reset and rebuild database
npm run db:reset && npm run db:build

# View database status
npm run db:status
```

## 🎯 SUCCESS CRITERIA

After execution, you should have:
- ✅ 6 tables created (users, sites, leads, communications, jobs, invoices)
- ✅ All foreign key relationships established
- ✅ All indexes created for optimal performance
- ✅ Row Level Security (RLS) enabled with proper policies
- ✅ Database views (user_sites_stats) created
- ✅ Database functions (get_user_total_leads) created
- ✅ Updated_at triggers for timestamp management
- ✅ TypeScript types generated
- ✅ Sample seed data loaded

## 🔍 VERIFICATION STEPS

1. **Check Tables**: Access Supabase Studio at `http://localhost:54323`
2. **Test RLS**: Verify policies are active in the Authentication section
3. **Verify Relationships**: Check foreign keys in the Database section
4. **Test Views**: Query `user_sites_stats` view
5. **Test Functions**: Execute `SELECT get_user_total_leads('user-uuid')`
6. **Check Types**: Verify `types/database.ts` file exists and is complete

## 🚨 TROUBLESHOOTING

If migration fails:
- Check `supabase/migrations/` directory for generated SQL files
- Review SQL syntax in generated migrations
- Check Supabase logs: `supabase logs`
- Reset and rebuild: `supabase db reset && npm run db:build`

If RLS policies fail:
- Verify auth.users table exists
- Check policy syntax in generated RLS migration
- Test policies in Supabase Studio

## 📊 EXPECTED OUTPUT

After successful execution:
- Database with 6 interconnected tables
- 15+ RLS policies for data security
- 10+ performance indexes
- 1 analytical view for user statistics
- 1 utility function for lead counting
- Auto-updating timestamps
- Full TypeScript type definitions

## 🎉 COMPLETION CONFIRMATION

When complete, you should be able to:
1. View all tables in Supabase Studio
2. See sample data in each table
3. Query the `user_sites_stats` view
4. Execute the `get_user_total_leads` function
5. Import and use TypeScript types in your application

**Your MicroSite database schema is now ready for production use!**
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      },
      "updated_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      }
    },
    "indexes": [
      "CREATE UNIQUE INDEX idx_users_email ON users(email)",
      "CREATE INDEX idx_users_stripe_id ON users(stripe_id)"
    ]
  },
  "sites": {
    "columns": {
      "id": {
        "type": "uuid",
        "primary_key": true,
        "not_null": true,
        "default": "uuid_generate_v4()"
      },
      "user_id": {
        "type": "uuid",
        "not_null": true,
        "references": "users(id)"
      },
      "name": {
        "type": "text",
        "not_null": true
      },
      "domain": {
        "type": "text",
        "nullable": true
      },
      "status": {
        "type": "text",
        "nullable": true
      },
      "github_repo": {
        "type": "text",
        "nullable": true
      },
      "netlify_url": {
        "type": "text",
        "nullable": true
      },
      "leads_count": {
        "type": "bigint",
        "nullable": true
      },
      "created_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      },
      "updated_at": {
        "type": "timestamptz",
        "not_null": true,
        "default": "now()"
      }
    },
    "indexes": [
      "CREATE INDEX idx_sites_user_id ON sites(user_id)",
      "CREATE INDEX idx_sites_domain ON sites(domain)",
      "CREATE INDEX idx_sites_status ON sites(status)"
    ]
  },
  "leads": {
    "columns": {
      "id": {
        "type": "uuid",
        "primary_key": true,
        "not_null": true,
        "default": "uuid_generate_v4()"
      },
      "site_id": {
        "type": "uuid",
        "not_null": true,
        "references": "sites(id)"
      },
      "name": {
        "type": "text",
        "not_null": true
      },
      "email": {
        "type": "text",
        "not_null": true
      },
      "phone": {
        "type": "text",
        "nullable": true
      },
      "message": {
        "type": "text",
        "nullable": true
      },
      "source": {
        "type": "text",
        "nullable": true
      },
      "status": {
        "type": "text",
        "nullable": true
      },
      "score_data": {
        "type": "jsonb",
        "nullable": true
      },
      "contact_info": {
        "type": "jsonb",
        "nullable": true
      },
      "tags": {
        "type": "jsonb",
        "nullable": true
      },
      "assigned_to": {
        "type": "text",
        "nullable": true
      },
      "follow_up_date": {
        "type": "timestamptz",
        "nullable": true
      },
      "marketing_campaign": {
        "type": "text",
        "nullable": true
      },
      "enriched_at": {
        "type": "timestamptz",
        "nullable": true
      },
      "created_at": {