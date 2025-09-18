### Job Description: Microsites Automation Operator

#### Position Overview
The Microsites Automation Operator is responsible for executing the Standard Operating Procedure (SOP) to rapidly build, launch, and manage a network of 50+ lead-generation microsites targeting hyper-local niches (e.g., "[Service] + [Location]" like "Garage Epoxy Flooring in Phoenix"). This role leverages a free tech stack (Google Sheets, Apps Script, GitHub, Hugo, Netlify, etc.) to automate content generation, site deployment, lead capture, and delivery. The goal is to scale to 5–10 new microsites per week, generating exclusive leads for clients in high-value local service verticals (e.g., epoxy flooring, pool heater repair). This is a hands-off, one-click workflow once set up, with a focus on quality control, monitoring, and basic maintenance to ensure sites rank, capture leads, and drive revenue ($149–$249/site/month + performance add-ons).

This role suits a tech-savvy VA, operations specialist, or founder with basic scripting and SEO knowledge. It's designed for lean operations, with ~1–2 hours of setup labor per site (covered by $199 setup fee) and 10–20 minutes/month per site for maintenance. Expected output: 500–1,500 live sites under management within 24 months, contributing to $360K–$430K annualized revenue.

#### Key Responsibilities
1. **Niche & Domain Research (Weekly Batch: 2–4 Hours)**
   - Identify profitable micro-verticals using Google Autocomplete, Bing Suggestions, and Keyword Surfer Chrome extension.
   - Validate keywords for search volume and intent; target underserved clusters (e.g., "pool heater repair [city]").
   - Check domain availability via Freenom (free .tk/.ml TLDs) or Namecheap/Porkbun (~$1–$2 for .com/.xyz alternatives; avoid unreliable Freenom post-2023).
   - Log results in a master Google Sheet (columns: Service, Location, Domain, Site Status, Leads, Client).
   - Automate via Google Apps Script: Scrape autosuggestions and batch-check domains.

2. **Website Setup & Deployment (Automated Core: ~30 Seconds/Site)**
   - Deploy lightweight static sites using Hugo (content in Markdown) on Netlify/Vercel free tiers.
   - Connect domains via Cloudflare free plan for SSL, CDN, and performance.
   - Use a single GitHub repo as a Hugo template; fork/clone per niche.
   - Trigger auto-deploys via GitHub Actions on content pushes.
   - Monitor builds in Netlify dashboard; ensure 99.9% uptime and fast load times (<2s).

3. **Content Generation & Page Structure (Automated: One-Click)**
   - Generate 50+ unique, SEO-optimized pages per site (e.g., Service Overview, Local Testimonials, FAQs, CTA).
   - Use ChatGPT free tier or OpenAI Playground for 450–600 word Markdown content, templated with prompts (e.g., "[Service] in [Location]").
   - Pull data from Google Sheet via Apps Script to auto-generate and push Markdown files to GitHub (`content/*.md`).
   - QA for uniqueness, local relevance, and thin content avoidance; ensure 600–900 words/page with NAP footprint.
   - Submit sitemaps to Google Search Console/Bing; monitor indexing (target 100% in 7–14 days).

4. **Lead Capture & Routing (Fully Automated)**
   - Embed Google Forms (or Typeform/Tally) for form leads; route responses to Google Sheets via Apps Script.
   - Set up Twilio (~$1/month) or Google Voice (US-only, free) numbers per site for call tracking.
   - Implement AI receptionist (Vapi/Retell free tier) for 24/7 answering, qualification, transcription, and voicemail-to-email.
   - Use Gmail filters or n8n (self-hosted Zapier alternative) for auto-forwarding to clients.
   - Track engagement: Filter for media/images/videos; min_faves/replies for quality.

5. **Lead Delivery & Monetization (Automated Notifications)**
   - Auto-email lead details (Name, Email, Phone, Timestamp) to clients via Apps Script on form submit.
   - Generate invoices from Google Docs templates (placeholders for Client, Details, Date, Amount: $75–$200/lead or flat fee).
   - Send branded HTML emails with logo, microsite link, lead details, and dashboard stats (leads/revenue).
   - Handle payments via PayPal.me or Stripe free plan; track in Google Sheets dashboard.
   - Optional: Weekly summary emails (e.g., Mondays) with client-specific stats, total leads, and revenue.

6. **Scaling & Maintenance (Ongoing: 5–10 Hours/Week)**
   - Add rows to master Google Sheet for new niches; run "Run All" master script (generates content → pushes to GitHub → deploys → notifies).
   - Scale to 5–10 sites/week; monitor KPIs (sites launched/week, time-to-first-lead, lead volume/site, cost/lead).
   - QA leads: Replace spam/dupes; enforce lead acceptance rate >90%.
   - Optimize: Monthly CRO iterations (headlines, CTAs); add citations/NAP management for Pro tier.
   - Churn reduction: ROI reports tying calls to jobs; performance SLAs (e.g., 7 leads/30 days or free month).

7. **Business Operations Support (As Needed)**
   - Support outbound sales: Build proof assets (live sites, call logs); personalize Looms/emails for 500 prospects in 2 verticals.
   - Onboard clients: Map ZIPs/services, set exclusivity, route leads.
   - Track unit economics: 80–90% gross margin; LTV:CAC >5:1; churn <3.5%/month.
   - Compliance: NAP consistency, no PBN interlinking, call recording consent, A2P 10DLC for SMS.

#### Required Skills & Tools
- **Technical Proficiency**: Basic JavaScript (Google Apps Script), Git/GitHub, Hugo basics, SEO fundamentals (GSC, sitemaps). No advanced coding—scripts provided.
- **Tools Mastery** (All Free/Cheap):
  - Google Workspace (Sheets, Apps Script, Forms, Docs, Gmail).
  - GitHub (repo management, Actions, PAT tokens).
  - Hosting: Netlify/Vercel (auto-deploy), Cloudflare (DNS/SSL).
  - Content: ChatGPT/OpenAI Playground, Keyword Surfer.
  - Leads: Twilio/Google Voice, n8n for workflows.
  - Monitoring: Google Analytics/Search Console, Stripe dashboard.
- **Soft Skills**: Detail-oriented, proactive QA, basic sales support (e.g., Loom videos).
- **Experience**: 1+ year in digital marketing/SEO/ops; familiarity with local lead-gen a plus.
- **Time Commitment**: 20–30 hours/week initially (ramp to full-time as sites scale); remote-friendly.

#### Performance Metrics & Success
- **Weekly KPIs**: 5–10 sites launched; 80% indexing rate; 3–6 qualified leads/site/month.
- **Monthly Goals**: $10K–$22K MRR by Month 6; <2-month CAC payback; 20–30% net margin.
- **Incentives**: Bonus on MRR milestones (e.g., 10% of first $50K); equity potential in SaaS spin-off.
- **Growth Path**: Evolve to Ops Lead (team management) or Product Manager (SaaS toolkit development).

This role turns the SOP into a "microsite factory," delivering predictable, high-margin leads while minimizing manual work. Apply by sharing a quick Loom demo of running the master script on a sample Sheet.