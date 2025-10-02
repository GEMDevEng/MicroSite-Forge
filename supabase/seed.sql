-- Sample seed data for MicroSite schema
-- Note: Users must exist in auth.users first, so we skip user inserts here
-- INSERT INTO users (id, email, stripe_id, created_at) VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', 'john@example.com', 'cus_123456', now()),
--   ('550e8400-e29b-41d4-a716-446655440001', 'jane@example.com', 'cus_789012', now());

-- INSERT INTO sites (id, user_id, name, domain, status, leads_count) VALUES
--   ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Tech Startup Landing', 'techstartup.com', 'live', 25),
--   ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'E-commerce Store', 'mystore.com', 'live', 42);

-- INSERT INTO leads (id, site_id, name, email, phone, company, status) VALUES
--   ('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Alice Johnson', 'alice@email.com', '+1234567890', 'Tech Corp', 'new'),
--   ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Bob Smith', 'bob@email.com', '+0987654321', 'Commerce Inc', 'contacted');

-- INSERT INTO communications (id, lead_id, type, content) VALUES
--   ('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'email', 'Thank you for your interest!'),
--   ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'sms', 'Hi Bob, here is the information you requested.');

-- INSERT INTO jobs (id, user_id, type, status, payload) VALUES
--   ('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'lead_enrichment', 'completed', '{"lead_id": "770e8400-e29b-41d4-a716-446655440000"}'),
--   ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'email_campaign', 'pending', '{"campaign_id": "camp_001"}');

-- INSERT INTO invoices (id, user_id, stripe_id, amount, currency, status) VALUES
--   ('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'in_123456789', 2999, 'usd', 'paid'),
--   ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'in_987654321', 4999, 'usd', 'pending');
