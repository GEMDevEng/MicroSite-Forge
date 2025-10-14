#!/bin/bash
# Wrangler Authentication Helper
# This script helps you authenticate with Cloudflare and set up resources

set -e

echo "🔐 Wrangler Authentication Helper"
echo "=================================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node.js version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v20\. ]]; then
    echo "⚠️  Warning: Node.js 20.x is recommended for Wrangler"
    echo "   Current version: $NODE_VERSION"
    echo ""
    echo "To install Node.js 20:"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Wrangler is available
echo ""
echo "📦 Checking Wrangler installation..."
if npx wrangler --version &> /dev/null; then
    WRANGLER_VERSION=$(npx wrangler --version)
    echo "   Wrangler version: $WRANGLER_VERSION"
else
    echo "❌ Wrangler not found. Installing..."
    npm install
fi

# Check authentication status
echo ""
echo "🔍 Checking authentication status..."
if npx wrangler whoami &> /dev/null; then
    echo "✅ Already authenticated!"
    npx wrangler whoami
    echo ""
    read -p "Re-authenticate? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping authentication."
        exit 0
    fi
fi

# Provide authentication options
echo ""
echo "🔐 Authentication Options:"
echo ""
echo "1. Browser-based login (recommended for local development)"
echo "2. Manual API token (recommended for CI/remote environments)"
echo "3. Skip authentication"
echo ""
read -p "Choose option (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo ""
        echo "🌐 Starting browser-based login..."
        echo ""
        echo "⚠️  Important:"
        echo "   - Ensure port 8976 is available"
        echo "   - Disable VPN/firewall temporarily if login fails"
        echo "   - Browser will open automatically"
        echo ""
        read -p "Press Enter to continue..."
        
        npx wrangler login
        
        echo ""
        if npx wrangler whoami &> /dev/null; then
            echo "✅ Authentication successful!"
            npx wrangler whoami
        else
            echo "❌ Authentication failed. Try option 2 (manual token)."
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "🔑 Manual API Token Setup"
        echo ""
        echo "Steps:"
        echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
        echo "2. Click 'Create Token'"
        echo "3. Use 'Edit Cloudflare Workers' template"
        echo "4. Click 'Continue to summary' > 'Create Token'"
        echo "5. Copy the token (shown only once!)"
        echo ""
        read -p "Press Enter when you have your token..."
        echo ""
        read -p "Paste your API token: " -s API_TOKEN
        echo ""
        
        if [ -z "$API_TOKEN" ]; then
            echo "❌ No token provided. Exiting."
            exit 1
        fi
        
        export CLOUDFLARE_API_TOKEN="$API_TOKEN"
        
        echo ""
        echo "Testing token..."
        if npx wrangler whoami &> /dev/null; then
            echo "✅ Token is valid!"
            npx wrangler whoami
            echo ""
            echo "To make this permanent, add to your shell profile:"
            echo "  echo 'export CLOUDFLARE_API_TOKEN=\"$API_TOKEN\"' >> ~/.zshrc"
            echo "  source ~/.zshrc"
        else
            echo "❌ Token is invalid or insufficient permissions."
            exit 1
        fi
        ;;
    3)
        echo "Skipping authentication."
        exit 0
        ;;
    *)
        echo "Invalid option. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Authentication complete!"
echo ""
echo "Next steps:"
echo "1. Create Cloudflare resources: ./scripts/create-cloudflare-resources.sh"
echo "2. Deploy worker: npx wrangler deploy"

