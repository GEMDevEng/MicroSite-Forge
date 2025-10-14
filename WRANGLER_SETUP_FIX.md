# Wrangler Authentication & Setup Fix Guide

## Current Issues Identified

Based on the feedback, you're experiencing:

1. **Wrangler login timeout** - OAuth callback not completing
2. **OAuth mismatch error** - "Received query string parameter doesn't match the one sent"
3. **macOS 12.6.0 compatibility warning** - Wrangler expects macOS 13.5+ (Ventura)
4. **Script syntax errors** - Bash script has unclosed quotes
5. **Invalid CLI arguments** - `--log-level` not supported (use `--verbose` instead)

---

## Quick Fix Steps

### Step 1: Verify Node.js Version

Ensure you're using Node.js 20.x (required for Wrangler):

```bash
node -v
```

If not v20.x, install it:

```bash
# Using nvm (recommended)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
node -v
```

### Step 2: Install/Update Wrangler

```bash
# Install Wrangler locally (already in package.json)
npm install

# Verify installation
npx wrangler --version
```

### Step 3: Fix Wrangler Login (Choose Method A or B)

#### Method A: Browser-Based Login (Recommended)

1. **Check port 8976 is available:**
   ```bash
   lsof -i :8976
   # If anything is using it, kill it: kill <PID>
   ```

2. **Temporarily disable firewall/VPN:**
   - System Preferences > Security & Privacy > Firewall > Turn Off
   - Disable any VPN/proxy temporarily

3. **Run login:**
   ```bash
   npx wrangler login
   ```
   
4. **Complete authorization in browser:**
   - Browser should open automatically
   - Click "Allow" on Cloudflare authorization page
   - Wait for "Successfully logged in" message
   - If timeout, wait 30+ seconds and retry

5. **Verify:**
   ```bash
   npx wrangler whoami
   ```

#### Method B: Manual Token (If Browser Login Fails)

1. **Create API token in Cloudflare Dashboard:**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Or create custom with these permissions:
     - Account > Workers Scripts > Edit
     - Account > Workers KV Storage > Edit
     - Account > Workers AI > Edit (if using AI features)
   - Click "Continue to summary" > "Create Token"
   - **Copy the token** (shown only once!)

2. **Set token as environment variable:**
   ```bash
   export CLOUDFLARE_API_TOKEN="your_token_here"
   ```

3. **Add to your shell profile for persistence:**
   ```bash
   echo 'export CLOUDFLARE_API_TOKEN="your_token_here"' >> ~/.zshrc
   # or ~/.bash_profile if using bash
   source ~/.zshrc
   ```

4. **Verify:**
   ```bash
   npx wrangler whoami
   ```

### Step 4: Fix wrangler.toml Configuration

The current `wrangler.toml` looks correct. Verify it has no duplicates:

```bash
cat wrangler.toml
```

Expected format (already correct in your file):
```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "research-data"

[[kv_namespaces]]
binding = "RESEARCH_CACHE"
id = "research_cache_namespace"
```

### Step 5: Create Cloudflare Resources

Once authenticated, create the required resources:

```bash
# Create Vectorize index
npx wrangler vectorize create research-data --dimensions=768 --metric=cosine

# Create KV namespace
npx wrangler kv:namespace create "RESEARCH_CACHE"
```

**Important:** Copy the KV namespace ID from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RESEARCH_CACHE"
id = "abc123def456"  # Replace with actual ID from command output
```

### Step 6: Test Deployment

```bash
# Test configuration
npx wrangler whoami

# Deploy (dry run first)
npx wrangler deploy --dry-run

# Actual deployment
npx wrangler deploy
```

---

## Alternative: Use Cloudflare Dashboard

If CLI continues to fail, you can create resources via the web dashboard:

1. **Login to Cloudflare Dashboard:** https://dash.cloudflare.com
2. **Create Vectorize Index:**
   - Go to Workers & Pages > Vectorize
   - Click "Create Index"
   - Name: `research-data`
   - Dimensions: 768
   - Metric: Cosine

3. **Create KV Namespace:**
   - Go to Workers & Pages > KV
   - Click "Create Namespace"
   - Name: `RESEARCH_CACHE`
   - Copy the namespace ID

4. **Update wrangler.toml** with the IDs from dashboard

---

## macOS Compatibility Issue

Your macOS 12.6.0 (Monterey) is below the recommended 13.5+ (Ventura). This may cause runtime issues.

### Option 1: Upgrade macOS (Recommended)
- System Preferences > Software Update
- Upgrade to macOS Ventura (13.x) or Sonoma (14.x)

### Option 2: Use Dev Container (Alternative)

If you can't upgrade macOS, use VS Code Dev Containers:

1. **Install Docker Desktop:**
   ```bash
   # If you have Homebrew
   brew install --cask docker
   ```

2. **Install Dev Containers extension in VS Code:**
   - Press `Cmd+Shift+X`
   - Search "Dev Containers"
   - Install "Dev Containers" by Microsoft

3. **Create `.devcontainer/devcontainer.json`:**
   ```json
   {
     "name": "MicroSite-Forge",
     "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
     "features": {
       "ghcr.io/devcontainers/features/node:1": {
         "version": "20"
       }
     },
     "postCreateCommand": "npm install",
     "customizations": {
       "vscode": {
         "extensions": [
           "dbaeumer.vscode-eslint",
           "esbenp.prettier-vscode"
         ]
       }
     }
   }
   ```

4. **Reopen in container:**
   - Press `Cmd+Shift+P`
   - Type "Dev Containers: Reopen in Container"
   - Wait for container to build
   - Run Wrangler commands inside container

---

## Troubleshooting Common Issues

### Issue: "wrangler: command not found"
**Fix:** Use `npx wrangler` instead of `wrangler`

### Issue: Login timeout after 30 seconds
**Fix:** 
- Check firewall/VPN settings
- Try manual token method (Method B above)
- Use incognito/private browser window

### Issue: "OAuth parameter mismatch"
**Fix:**
- Don't modify the URL when copying
- Try different browser (Chrome/Firefox)
- Clear browser cache and retry
- Use manual token method instead

### Issue: "Invalid argument --log-level"
**Fix:** Use `--verbose` instead:
```bash
npx wrangler login --verbose
```

### Issue: Script syntax errors
**Fix:** Don't use the bash script yet. Run commands manually as shown above.

---

## Verification Checklist

After completing the steps above, verify:

- [ ] `node -v` shows v20.x
- [ ] `npx wrangler --version` works
- [ ] `npx wrangler whoami` shows your account
- [ ] `wrangler.toml` has correct format (no duplicates)
- [ ] Vectorize index created: `npx wrangler vectorize list`
- [ ] KV namespace created: `npx wrangler kv:namespace list`
- [ ] `wrangler.toml` updated with actual KV namespace ID
- [ ] `npx wrangler deploy --dry-run` succeeds

---

## Next Steps After Authentication

Once Wrangler is authenticated and configured:

1. **Update environment variables** in `.env.local`:
   ```env
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_token
   CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev
   ```

2. **Test the worker locally:**
   ```bash
   npx wrangler dev
   ```

3. **Deploy to production:**
   ```bash
   npx wrangler deploy
   ```

4. **Populate vector database** with research data (separate script)

---

## Quick Command Reference

```bash
# Authentication
npx wrangler login                    # Browser-based login
npx wrangler whoami                   # Check auth status
export CLOUDFLARE_API_TOKEN="..."    # Manual token

# Resource Management
npx wrangler vectorize list           # List Vectorize indexes
npx wrangler vectorize create NAME    # Create index
npx wrangler kv:namespace list        # List KV namespaces
npx wrangler kv:namespace create NAME # Create namespace

# Deployment
npx wrangler dev                      # Local development
npx wrangler deploy --dry-run         # Test deployment
npx wrangler deploy                   # Deploy to production
npx wrangler tail                     # View logs

# Debugging
npx wrangler --version                # Check version
npx wrangler --verbose login          # Verbose login
```

---

## Support Resources

- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Workers AI:** https://developers.cloudflare.com/workers-ai/
- **Vectorize:** https://developers.cloudflare.com/vectorize/
- **KV Storage:** https://developers.cloudflare.com/kv/
- **Community:** https://community.cloudflare.com/

---

**Start with Step 3 (Method B - Manual Token) if browser login continues to fail. This is the most reliable method for remote/CI environments.**

