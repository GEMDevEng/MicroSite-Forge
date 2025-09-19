# CI/CD Pipeline Setup Guide

This guide will help you configure the GitHub Actions CI/CD pipeline for MicroSite Forge.

## 📋 Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Basic Configuration
Navigate to: **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### Vercel Deployment
- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_PROJECT_REF`: Your Supabase project reference ID
- `SUPABASE_ACCESS_TOKEN`: Your Supabase access token

#### Code Coverage
- `CODECOV_TOKEN`: Your Codecov upload token

## 🔧 Getting Your Secrets

### Vercel Secrets

1. **Generate Vercel Token:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard/account/tokens)
   - Create a new token with appropriate permissions
   - Copy the token value

2. **Get Organization and Project IDs:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link project
   vercel link
   
   # Get project info
   vercel project ls
   ```
   The output will show your `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.

### Supabase Secrets

1. **Project URL and Keys:**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your project
   - Go to **Settings** → **API**
   - Copy the Project URL and `anon/public` key
   - For `supabase_anon key`, use the `public` key

2. **Service Role Key:**
   - In the same API settings page
   - Copy the `service_role` key (keep this secret!)

3. **Project Reference:**
   - In Supabase Dashboard, go to **Settings** → **General**
   - Copy the **Reference ID**

4. **Access Token:**
   - Go to [Supabase Access Tokens](https://app.supabase.com/account/tokens)
   - Generate a new access token
   - Grant appropriate permissions for GitHub Actions

### Codecov Token

1. **Get Codecov Token:**
   - Go to [Codecov Dashboard](https://app.codecov.io/)
   - Link your GitHub repository
   - Copy the repository token

## 🚀 Pipeline Trigger Conditions

The CI/CD pipeline runs on:

- **Push** to `main` and `develop` branches
- **Pull Requests** targeting the `main` branch

### Workflow Jobs

#### 1. Test Job
Runs on every trigger and includes:
- **Linting** (`npm run lint`)
- **Type Checking** (`npm run type-check`)
- **Unit Tests** with coverage (`npm run test`)
- **Integration Tests** (`npm run test:integration`)
- **Code Coverage Check** (80% minimum)
- **Build** (`npm run build`)
- **E2E Tests** (`npm run test:e2e`)

#### 2. Deploy Staging Job
- **Trigger**: Push to `develop` branch
- **Process**: Deploys to Vercel preview environment
- **Requirements**: All tests must pass

#### 3. Deploy Production Job
- **Trigger**: Push to `main` branch
- **Process**: Deploys to Vercel production + Supabase functions
- **Requirements**: All tests must pass

## 📊 Code Quality Gates

### Test Coverage
- **Threshold**: 80% overall code coverage
- **Measurable**: Lines, branches, functions, statements
- **Action**: Pipeline fails if below threshold

### Linting and TypeScript
- **ESLint**: Must pass with no errors
- **TypeScript**: Type checking must pass with no errors
- **Action**: Pipeline fails if any issues found

### Build Requirements
- **Build**: Application must build successfully
- **Assets**: All static assets must be generated
- **Action**: Pipeline fails if build encounters errors

## 🔐 Environment Variables for Testing

For integration and E2E tests, the pipeline uses Supabase staging/development environment:

```yaml
# For integration tests
SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

# For E2E tests
NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

## ⚠️ Troubleshooting

### Common Issues

1. **Secret Not Found Error:**
   - Verify secret names match exactly (case-sensitive)
   - Check if secrets are set at repository level
   - Ensure secrets have no leading/trailing whitespace

2. **Build Errors Due to Missing Dependencies:**
   - **Issue**: Module not found errors (e.g., @radix-ui/react-label)
   - **Solution**: Run `npm install` to install all dependencies from package.json
   - **Prevention**: Always commit package-lock.json after installing new packages
   - **Common missing packages**: @radix-ui/react-label for form components

2. **Vercel Deployment Fails:**
   - Verify `VERCEL_TOKEN` has correct permissions
   - Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
   - Ensure your Vercel account has access to the project

3. **Supabase Connection Issues:**
   - Verify all Supabase secrets are set correctly
   - Check if Supabase project allows connections from GitHub Actions
   - Ensure database is accessible

4. **Code Coverage Below Threshold:**
   - Run `npm run test:coverage` locally to check coverage
   - Add tests for uncovered code sections
   - Review coverage report at `coverage/lcov-report/index.html`

### Debugging Pipeline

1. **View Workflow Logs:**
   - Go to **Actions** tab in your repository
   - Click on the failed workflow run
   - Check logs for each step

2. **Test Locally:**
   ```bash
   # Run full test suite locally
   npm run lint
   npm run type-check
   npm run test -- --coverage
   npm run test:integration
   npm run build
   npm run test:e2e
   ```

3. **Validate Secrets:**
   - Create a simple workflow to test secret access
   - Use repository secrets in a test job

## 🔄 Workflow Structure

```yaml
.github/workflows/ci.yml
├── on:                        # Triggers
│   ├── push: [main, develop]  # Push to main/develop
│   └── pull_request: [main]   # PR to main
├── jobs:
│   ├── test:                  # Quality checks
│   │   ├── lint
│   │   ├── type-check
│   │   ├── unit tests
│   │   ├── integration tests
│   │   ├── coverage check
│   │   ├── build
│   │   └── e2e tests
│   ├── deploy-staging:        # Deploy to staging
│   └── deploy-production:     # Deploy to production
```

## 📈 Monitoring Pipeline Health

- **Success Rate**: Monitor workflow success over time
- **Build Times**: Track how long builds take to complete
- **Coverage Trends**: Monitor code coverage over time
- **Failure Patterns**: Identify common failure points

### Recommended Tools
- **GitHub Actions Insights**: Built-in analytics
- **Codecov**: Coverage reporting and trends
- **Sentry**: Error tracking and performance monitoring

---

For questions about CI/CD setup or troubleshooting, refer to the [Deployment Guide](docs/technical/deployment/Deployment-Guide.md) or create an issue in the repository.
