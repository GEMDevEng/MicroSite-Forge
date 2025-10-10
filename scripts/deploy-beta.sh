#!/bin/bash
# Beta deployment script for MicroSite Forge
# Sets up beta environment with RAG enabled and beta features

set -e

echo "🚀 Deploying MicroSite Forge Beta Environment"

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN not set"
    exit 1
fi

if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo "Error: NETLIFY_AUTH_TOKEN not set"
    exit 1
fi

# Set environment variables for beta
export NODE_ENV=production
export ENABLE_BETA_FEATURES=true
export ENABLE_RAG_RESEARCH=true

# Deploy to Vercel with beta-specific environment
echo "📦 Deploying to Vercel..."
npx vercel --prod \
  --env NODE_ENV=production \
  --env ENABLE_BETA_FEATURES=true \
  --env ENABLE_RAG_RESEARCH=true \
  --env CLOUDFLARE_WORKER_URL="$CLOUDFLARE_WORKER_URL" \
  --env GROK_API_KEY="$GROK_API_KEY" \
  --env NETLIFY_AUTH_TOKEN="$NETLIFY_AUTH_TOKEN"

# Output deployment info
echo "✅ Beta deployment completed!"
echo "🌐 Beta site will be available at: $(npx vercel ls | grep -E 'https://' | head -1)"
echo ""
echo "🔧 Beta environment settings:"
echo "  - RAG Research: Enabled"
echo "  - Beta Features: Enabled"
echo "  - Beta Signup: Available at /beta"
echo ""
echo "📝 Next steps:"
echo "  - Set up Cloudflare Workers RAG if not already done"
echo "  - Share the beta URL with testers"
echo "  - Monitor beta usage and feedback"
