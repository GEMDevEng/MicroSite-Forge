#!/bin/bash
# Create Cloudflare Resources for RAG Integration
# Run this after authenticating with Wrangler

set -e

echo "🛠️  Creating Cloudflare Resources for RAG Integration"
echo "====================================================="
echo ""

# Check authentication
echo "🔍 Checking authentication..."
if ! npx wrangler whoami &> /dev/null; then
    echo "❌ Not authenticated with Cloudflare."
    echo ""
    echo "Please run authentication first:"
    echo "  ./scripts/wrangler-auth-helper.sh"
    echo ""
    echo "Or manually:"
    echo "  npx wrangler login"
    exit 1
fi

echo "✅ Authenticated as:"
npx wrangler whoami
echo ""

# Create Vectorize index
echo "📊 Creating Vectorize index 'research-data'..."
echo ""

if npx wrangler vectorize list 2>/dev/null | grep -q "research-data"; then
    echo "⚠️  Vectorize index 'research-data' already exists."
    read -p "Recreate it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deleting existing index..."
        npx wrangler vectorize delete research-data || true
        echo "Creating new index..."
        npx wrangler vectorize create research-data --dimensions=768 --metric=cosine
    else
        echo "Keeping existing index."
    fi
else
    npx wrangler vectorize create research-data --dimensions=768 --metric=cosine
fi

echo ""
echo "✅ Vectorize index ready"
echo ""

# Create KV namespace
echo "🗄️  Creating KV namespace 'RESEARCH_CACHE'..."
echo ""

# Check if namespace already exists
EXISTING_KV=$(npx wrangler kv:namespace list 2>/dev/null | grep "RESEARCH_CACHE" || echo "")

if [ -n "$EXISTING_KV" ]; then
    echo "⚠️  KV namespace 'RESEARCH_CACHE' already exists:"
    echo "$EXISTING_KV"
    
    # Extract ID from existing namespace
    KV_ID=$(echo "$EXISTING_KV" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$KV_ID" ]; then
        echo "Using existing namespace ID: $KV_ID"
    else
        echo "❌ Could not extract namespace ID. Please check manually."
        exit 1
    fi
else
    echo "Creating new KV namespace..."
    KV_OUTPUT=$(npx wrangler kv:namespace create "RESEARCH_CACHE")
    echo "$KV_OUTPUT"
    
    # Extract ID from output
    KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    
    if [ -z "$KV_ID" ]; then
        echo "❌ Could not extract KV namespace ID from output."
        echo "Please check the output above and update wrangler.toml manually."
        exit 1
    fi
    
    echo "✅ KV namespace created with ID: $KV_ID"
fi

echo ""

# Update wrangler.toml with actual KV ID
echo "📝 Updating wrangler.toml with KV namespace ID..."

if [ -f "wrangler.toml" ]; then
    # Create backup
    cp wrangler.toml wrangler.toml.backup
    
    # Update the ID in wrangler.toml
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/id = \"research_cache_namespace\"/id = \"$KV_ID\"/" wrangler.toml
    else
        # Linux
        sed -i "s/id = \"research_cache_namespace\"/id = \"$KV_ID\"/" wrangler.toml
    fi
    
    echo "✅ wrangler.toml updated (backup saved as wrangler.toml.backup)"
else
    echo "❌ wrangler.toml not found!"
    exit 1
fi

echo ""

# Check Workers AI access
echo "🤖 Checking Workers AI access..."
if npx wrangler ai models list &> /dev/null; then
    echo "✅ Workers AI is accessible"
    echo ""
    echo "Available AI models:"
    npx wrangler ai models list | head -10
else
    echo "⚠️  Workers AI may not be enabled on your account."
    echo ""
    echo "To use AI features, you need:"
    echo "1. Workers Paid plan or higher"
    echo "2. Workers AI enabled"
    echo ""
    echo "Visit: https://developers.cloudflare.com/workers-ai/get-started/"
fi

echo ""
echo "📋 Resource Summary:"
echo "==================="
echo ""
echo "✅ Vectorize Index:"
echo "   Name: research-data"
echo "   Dimensions: 768"
echo "   Metric: cosine"
echo ""
echo "✅ KV Namespace:"
echo "   Binding: RESEARCH_CACHE"
echo "   ID: $KV_ID"
echo ""
echo "✅ AI Binding:"
echo "   Binding: AI"
echo "   Status: Check above"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Review wrangler.toml to ensure configuration is correct"
echo "2. Test deployment:"
echo "   npx wrangler deploy --dry-run"
echo ""
echo "3. Deploy to production:"
echo "   npx wrangler deploy"
echo ""
echo "4. Set environment variables in .env.local:"
echo "   CLOUDFLARE_ACCOUNT_ID=<your-account-id>"
echo "   CLOUDFLARE_WORKER_URL=<your-worker-url>"
echo ""
echo "5. Populate vector database with research data"
echo ""
echo "✅ Setup complete!"

