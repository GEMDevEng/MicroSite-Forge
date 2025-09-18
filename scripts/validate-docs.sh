#!/bin/bash

# Documentation Link Validation Script
# Validates that all referenced documentation files exist

echo "🔍 Validating documentation links..."

# Array of file paths referenced in documentation
declare -a files=(
    "docs/planning/requirements/MicroSite Forge MVP: Technical PRD.md"
    "docs/planning/requirements/SRS for MicroSite Forge MVP.md"
    "docs/planning/implementation/Implementation-Plan.md"
    "docs/planning/implementation/MicroSite Forge MVP- Features & Results Document.md"
    "docs/technical/Tech-Stack-Specification.md"
    "docs/technical/architecture/MicroSite Forge MVP- Backend Structure .md"
    "docs/technical/architecture/MicroSite Forge MVP- Frontend Guidelines .md"
    "docs/technical/architecture/MicroSite Forge- Detailed App Flow Document.md"
    "docs/technical/deployment/Deployment-Guide.md"
    "docs/business/product/MicroSite Forge Product Description.md"
    "docs/business/market/MicroSite Forge: Target Audience Analysis.md"
    "docs/business/legal/Job Description: Microsites Automation Operator.md"
    "docs/guides/setup/Microsites Blueprint .md"
    "docs/guides/development/Development-Guidelines.md"
    "docs/CONTRIBUTING.md"
    "docs/README.md"
)

# Validation counters
valid_count=0
invalid_count=0

echo "📋 Checking ${#files[@]} documentation files..."
echo ""

# Check each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
        ((valid_count++))
    else
        echo "❌ $file (NOT FOUND)"
        ((invalid_count++))
    fi
done

echo ""
echo "📊 Validation Results:"
echo "✅ Valid files: $valid_count"
echo "❌ Invalid files: $invalid_count"
echo "📁 Total files checked: ${#files[@]}"

if [ $invalid_count -eq 0 ]; then
    echo ""
    echo "🎉 All documentation links are valid!"
    exit 0
else
    echo ""
    echo "⚠️  Found $invalid_count broken links. Please fix them."
    exit 1
fi
