# 🚀 MicroSite Forge

**The AI-Powered Microsite Factory for Local Lead Generation**

A fully automated web application that builds, deploys, and manages a scalable network of 100+ exact-match microsites per client. No coding, no manual research, no ops team required.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)

## 🎯 Project Overview

MicroSite Forge revolutionizes local lead generation by automating the entire microsites Standard Operating Procedure (SOP). Built for SMB owners, solo entrepreneurs, and digital agencies, it transforms niche research into live, ranking sites in under 60 seconds.

### Key Features
- **🤖 AI-Powered Research**: Automated niche discovery and keyword analysis using Grok 4 and OpenAI
- **⚡ Instant Deployment**: One-click batch launches with Hugo + Netlify integration
- **📞 Smart Lead Capture**: Multi-channel lead routing with AI call handling via Twilio + Vapi
- **📊 Real-time Analytics**: Comprehensive dashboards with Google Search Console integration
- **💰 Automated Billing**: Stripe-powered subscription and performance-based billing
- **🎨 White-label Ready**: Full customization for agency partners

### Business Impact
- **Revenue**: Target $19K MRR by Month 6 with 30 clients
- **Efficiency**: 95% time savings (from 2hrs/site to <1min)
- **Scale**: Support 100+ sites per user with 99.9% uptime
- **Quality**: 3-6 qualified leads per site per month at $75-$200 each

## 📁 Project Structure

```
MicroSite-Forge/
├── 📚 docs/                          # Comprehensive documentation
│   ├── 📋 planning/                  # Project planning & requirements
│   │   ├── requirements/             # PRD, SRS, and specifications
│   │   ├── implementation/           # Implementation plans & features
│   │   └── roadmap/                  # Future development roadmap
│   ├── 🏗️ technical/                 # Technical documentation
│   │   ├── architecture/             # System architecture & design
│   │   ├── api/                      # API documentation
│   │   └── deployment/               # Deployment guides
│   ├── 💼 business/                  # Business documentation
│   │   ├── product/                  # Product descriptions & specs
│   │   ├── market/                   # Market analysis & strategy
│   │   └── legal/                    # Legal documents & compliance
│   └── 📖 guides/                    # User & developer guides
│       ├── setup/                    # Installation & setup guides
│       ├── usage/                    # User manuals & tutorials
│       └── development/              # Development guidelines
├── 🎨 frontend/                      # Next.js frontend application
├── ⚙️ backend/                       # Supabase Edge Functions
├── 🏗️ infrastructure/               # Deployment configurations
├── 🧪 tests/                        # Test suites
└── 📄 README.md                     # This file
```

### 📚 Documentation Overview

Our documentation is organized into four main categories:

#### 📋 Planning Documents
- **[Technical PRD](docs/planning/requirements/MicroSite%20Forge%20MVP:%20Technical%20PRD.md)** - Comprehensive product requirements
- **[Software Requirements Specification](docs/planning/requirements/SRS%20for%20MicroSite%20Forge%20MVP.md)** - Detailed functional requirements
- **[Implementation Plan](docs/planning/implementation/Implementation-Plan.md)** - Development roadmap and timeline
- **[Features & Results](docs/planning/implementation/MicroSite%20Forge%20MVP-%20Features%20&%20Results%20Document.md)** - Feature specifications and expected outcomes

#### 🏗️ Technical Documentation
- **[Tech Stack Specification](docs/technical/Tech-Stack-Specification.md)** - Complete technology stack overview
- **[Backend Architecture](docs/technical/architecture/MicroSite%20Forge%20MVP-%20Backend%20Structure%20.md)** - Backend system design
- **[Frontend Guidelines](docs/technical/architecture/MicroSite%20Forge%20MVP-%20Frontend%20Guidelines%20.md)** - Frontend development standards
- **[App Flow Documentation](docs/technical/architecture/MicroSite%20Forge-%20Detailed%20App%20Flow%20Document.md)** - User experience flows
- **[Deployment Guide](docs/technical/deployment/Deployment-Guide.md)** - Complete deployment instructions

#### 💼 Business Documentation
- **[Product Description](docs/business/product/MicroSite%20Forge%20Product%20Description.md)** - Complete product overview
- **[Target Audience Analysis](docs/business/market/MicroSite%20Forge:%20Target%20Audience%20Analysis.md)** - Market research and personas
- **[Job Description](docs/business/legal/Job%20Description:%20Microsites%20Automation%20Operator.md)** - Role definitions

#### 📖 User Guides
- **[Setup Guide](docs/guides/setup/Microsites%20Blueprint%20.md)** - Complete setup and automation guide
- **[Development Guidelines](docs/guides/development/Development-Guidelines.md)** - Development standards and best practices
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** - How to contribute to the project
- **[Documentation Index](docs/README.md)** - Navigation guide for all documentation

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS v3 with Headless UI components
- **State Management**: Zustand for lightweight state management
- **Data Fetching**: SWR for caching and real-time updates
- **Charts**: Chart.js v4 for analytics visualization

### Backend
- **Runtime**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL 15 with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **Queue**: BullMQ with Upstash Redis
- **Workflows**: n8n for automation orchestration

### AI & Integrations
- **AI Research**: Grok 4 API for niche discovery
- **Content Generation**: OpenAI GPT-4 for content creation
- **Communication**: Twilio + Vapi AI for call handling
- **Payments**: Stripe for subscription and billing
- **Hosting**: Netlify for microsites, Vercel for main app

### Development Tools
- **Testing**: Jest + React Testing Library + Playwright
- **Code Quality**: ESLint + Prettier + Husky
- **Documentation**: Storybook for component documentation
- **Monitoring**: Sentry for error tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 20.6+ (LTS recommended)
- npm 9.8+ or yarn 1.22+
- Git for version control
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GEMDevEng/MicroSite-Forge.git
   cd MicroSite-Forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database setup**
   ```bash
   npx supabase start
   npx supabase db reset
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI APIs
GROK_API_KEY=your_grok_api_key
OPENAI_API_KEY=your_openai_api_key

# Communication
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Deployment
NETLIFY_AUTH_TOKEN=your_netlify_token
GITHUB_TOKEN=your_github_token
```

## 📖 Usage Guide

### For Developers
1. **Start with the [Technical PRD](docs/planning/requirements/MicroSite%20Forge%20MVP:%20Technical%20PRD.md)** for project overview
2. **Review [Tech Stack Specification](docs/technical/Tech-Stack-Specification.md)** for technology details
3. **Follow [Implementation Plan](docs/planning/implementation/Implementation-Plan.md)** for development roadmap
4. **Check [Backend Architecture](docs/technical/architecture/MicroSite%20Forge%20MVP-%20Backend%20Structure%20.md)** for system design

### For Product Managers
1. **Read [Product Description](docs/business/product/MicroSite%20Forge%20Product%20Description.md)** for business overview
2. **Review [Features & Results](docs/planning/implementation/MicroSite%20Forge%20MVP-%20Features%20&%20Results%20Document.md)** for feature specifications
3. **Study [Target Audience Analysis](docs/business/market/MicroSite%20Forge:%20Target%20Audience%20Analysis.md)** for market insights

### For End Users
1. **Follow [Setup Guide](docs/guides/setup/Microsites%20Blueprint%20.md)** for initial configuration
2. **Review [App Flow Documentation](docs/technical/architecture/MicroSite%20Forge-%20Detailed%20App%20Flow%20Document.md)** for user workflows

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Testing Strategy
- **Unit Tests**: 80% minimum coverage requirement
- **Integration Tests**: API endpoint and service testing
- **E2E Tests**: Complete user journey validation
- **Performance Tests**: Load testing with Artillery

## 🚀 Deployment

### Development Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Production Requirements
- **Frontend**: Vercel with automatic deployments
- **Backend**: Supabase managed services
- **Microsites**: Netlify with GitHub integration
- **Monitoring**: Sentry for error tracking

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before getting started.

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow Next.js recommended rules
- **Prettier**: Automatic code formatting
- **Testing**: Maintain 80%+ test coverage
- **Documentation**: Update docs for new features

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit messages:

```
feat: add new AI research integration
fix: resolve authentication token expiry
docs: update API documentation
test: add unit tests for lead processing
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **[Complete Documentation](docs/README.md)** - Navigate all project documentation
- **[Technical Support](docs/technical/)** - Technical implementation guides
- **[User Guides](docs/guides/)** - Setup and usage instructions

### Community
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community Q&A and feature discussions
- **Discord**: Real-time community support (coming soon)

### Commercial Support
For enterprise support, custom implementations, or consulting services, contact our team at [support@micrositeforge.com](mailto:support@micrositeforge.com).

## 🗺️ Roadmap

### Current Phase: MVP Development (Q4 2025)
- ✅ Core infrastructure and authentication
- ✅ AI integration for research and content
- 🔄 Lead capture and processing system
- 🔄 Analytics and billing integration

### Q1 2026: Enhancement & Scale
- Advanced AI tuning and customization
- Multi-tenant client portal
- SMS integration and automation
- Advanced analytics and reporting

### Q2 2026: Market Expansion
- EMD Hunter SaaS spin-off
- Lead marketplace beta
- White-label solutions
- International market expansion

## 📊 Project Status

- **Development Phase**: MVP Implementation
- **Target Launch**: Q4 2025
- **Beta Testing**: 50 users (October 2025)
- **Public Launch**: December 2025

---

**Built with ❤️ by the MicroSite Forge Team**

*Transforming local lead generation through AI-powered automation*
