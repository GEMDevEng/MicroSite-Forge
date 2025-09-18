# Development Setup Guide

This guide will help you set up the MicroSite Forge development environment.

## Prerequisites

- Node.js 20.6+ (LTS recommended)
- npm 9.8+ or yarn 1.22+
- Git 2.40+
- Supabase account (for backend services)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/MicroSite-Forge.git
   cd MicroSite-Forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required for basic functionality
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional for full functionality
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   └── providers/         # Context providers
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards (ESLint + Prettier)
   - Add tests for new functionality
   - Update documentation as needed

3. **Run tests and checks**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing

### Unit Tests
- Located in `src/**/__tests__/` or `src/**/*.test.ts`
- Use Jest + React Testing Library
- Run with `npm run test`

### E2E Tests
- Located in `tests/e2e/`
- Use Playwright
- Run with `npm run test:e2e`

### Coverage
- Minimum 80% coverage required
- Run `npm run test:coverage` to generate report

## Code Standards

### TypeScript
- Strict mode enabled
- Use proper typing (avoid `any`)
- Define interfaces for all data structures

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types

### Styling
- Use Tailwind CSS for styling
- Follow design system conventions
- Use CSS variables for theming

### Git Commits
- Use conventional commit format
- Examples: `feat:`, `fix:`, `docs:`, `test:`

## Debugging

### VS Code Setup
Recommended extensions:
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Jest

### Browser DevTools
- React Developer Tools
- Redux DevTools (for Zustand)

## Troubleshooting

### Common Issues

1. **Build errors**
   - Check TypeScript errors: `npm run type-check`
   - Check ESLint errors: `npm run lint`

2. **Test failures**
   - Check test output for specific errors
   - Ensure all mocks are properly configured

3. **Environment issues**
   - Verify all required environment variables are set
   - Check Supabase connection

### Getting Help

- Check the [documentation](docs/README.md)
- Review existing issues on GitHub
- Ask questions in team discussions

## Performance

### Development
- Use React DevTools Profiler
- Monitor bundle size with `npm run build`
- Check Core Web Vitals

### Production
- Monitor with Sentry
- Use Vercel Analytics
- Track performance metrics

---

For more detailed information, see the [complete documentation](docs/README.md).
