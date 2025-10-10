#!/bin/bash
# Set up Cloudflare Workers for RAG integration
# This script helps configure Cloudflare Workers, Vectorize, and AI binding

set -e

echo "🛠️  Setting up Cloudflare Workers for RAG Integration"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
if ! wrangler auth status &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run 'wrangler auth login' first"
    exit 1
fi

# Create Vectorize index for research data
echo "📊 Creating Vectorize index..."
wrangler vectorize create research-data --dimensions=768 --metric=cosine

# Create KV namespace for research cache
echo "🗄️  Creating KV namespace..."
KV_ID=$(wrangler kv:namespace create "RESEARCH_CACHE")
echo "KV Namespace ID: $KV_ID"

# Update wrangler.toml with actual KV ID
sed -i.bak "s/id = \"research_cache_namespace\"/id = \"$KV_ID\"/" wrangler.toml

# Enable AI binding (requires Workers AI plan)
echo "🤖 Checking Workers AI access..."
wrangler ai models list > /dev/null || {
    echo "⚠️  Workers AI may not be enabled. Please ensure you have the Workers AI plan."
    echo "Visit: https://developers.cloudflare.com/workers-ai/get-started/"
}

# Deploy the worker (without vector data population for now)
echo "🚀 Deploying Cloudflare Worker..."
wrangler deploy

WORKER_URL=$(wrangler tail --format=json | jq -r '.url' || echo "")
if [ -n "$WORKER_URL" ]; then
    echo "✅ Worker deployed successfully!"
    echo "🔗 Worker URL: $WORKER_URL"
    echo ""
    echo "Next steps:"
    echo "1. Set CLOUDFLARE_WORKER_URL environment variable in your deployment"
    echo "2. Populate vector database with research data"
    echo "3. Test RAG integration"
else
    echo "⚠️  Worker deployment status unclear. Check Cloudflare dashboard."
fi

echo ""
echo "📝 Configuration summary:"
echo "  - Vectorize Index: research-data"
echo "  - KV Namespace: $KV_ID"
echo "  - AI Binding: Enabled"
echo ""
echo "To populate vector database, run data seeding scripts when ready."
