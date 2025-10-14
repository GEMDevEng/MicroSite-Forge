# Cloudflare Wrangler Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Authenticate with Cloudflare

**Option A: Browser Login (Easiest for local development)**

```bash
npx wrangler login
```

If this times out or fails, try Option B.

**Option B: Manual API Token (Most Reliable)**

1. Create token at: https://dash.cloudflare.com/profile/api-tokens
2. Use "Edit Cloudflare Workers" template
3. Copy the token
4. Set it:
   ```bash
   export CLOUDFLARE_API_TOKEN="your_token_here"
   ```
5. Verify:
   ```bash
   npx wrangler whoami
   ```

**Or use the helper script:**

```bash
./scripts/wrangler-auth-helper.sh
```

### Step 2: Create Cloudflare Resources

```bash
./scripts/create-cloudflare-resources.sh
```

This will create:
- Vectorize index for embeddings
- KV namespace for caching
- Update wrangler.toml with IDs

### Step 3: Deploy

```bash
# Test first
npx wrangler deploy --dry-run

# Deploy to production
npx wrangler deploy
```

---

## 🔧 Troubleshooting

### Issue: Login timeout

**Solution:**
1. Check port 8976 is free: `lsof -i :8976`
2. Disable firewall/VPN temporarily
3. Use manual token method (Option B above)

### Issue: "OAuth parameter mismatch"

**Solution:**
- Use manual token method instead
- Don't modify the OAuth URL
- Try incognito browser

### Issue: macOS 12.6.0 warning

**Solution:**
- Upgrade to macOS 13.5+ (Ventura) if possible
- Or use manual token method (works on older macOS)
- Or use Dev Containers (see WRANGLER_SETUP_FIX.md)

### Issue: "wrangler: command not found"

**Solution:**
Always use `npx wrangler` instead of `wrangler`

---

## 📋 Verification Checklist

After setup, verify:

```bash
# Check authentication
npx wrangler whoami

# List resources
npx wrangler vectorize list
npx wrangler kv:namespace list

# Check wrangler.toml
cat wrangler.toml
```

Expected output:
- ✅ Authenticated as your email
- ✅ Vectorize index "research-data" exists
- ✅ KV namespace "RESEARCH_CACHE" exists
- ✅ wrangler.toml has actual KV namespace ID (not "research_cache_namespace")

---

## 🎯 Common Commands

```bash
# Authentication
npx wrangler login                    # Browser login
npx wrangler whoami                   # Check status
export CLOUDFLARE_API_TOKEN="..."    # Set token

# Development
npx wrangler dev                      # Local dev server
npx wrangler tail                     # View logs

# Deployment
npx wrangler deploy --dry-run         # Test
npx wrangler deploy                   # Deploy

# Resources
npx wrangler vectorize list           # List indexes
npx wrangler kv:namespace list        # List namespaces
npx wrangler ai models list           # List AI models
```

---

## 📚 Full Documentation

For detailed troubleshooting and alternative methods, see:
- **WRANGLER_SETUP_FIX.md** - Comprehensive fix guide
- **Cloudflare Docs:** https://developers.cloudflare.com/workers/

---

## ⚡ TL;DR - Fastest Path

If browser login fails, use this:

```bash
# 1. Get token from: https://dash.cloudflare.com/profile/api-tokens
# 2. Set it:
export CLOUDFLARE_API_TOKEN="your_token_here"

# 3. Verify:
npx wrangler whoami

# 4. Create resources:
./scripts/create-cloudflare-resources.sh

# 5. Deploy:
npx wrangler deploy
```

Done! 🎉

