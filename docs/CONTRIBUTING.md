# Contributing to MicroSite Forge

Thank you for your interest in contributing to MicroSite Forge! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions
- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Submit bug fixes or new features
- **Documentation**: Improve or add to our documentation
- **Testing**: Help test new features and report issues

### Before You Start
1. **Check existing issues** to avoid duplicating work
2. **Read our documentation** to understand the project structure
3. **Review the codebase** to understand our coding standards
4. **Join our discussions** for questions and coordination

## 🛠️ Development Setup

### Prerequisites
- Node.js 20.6+ (LTS recommended)
- npm 9.8+ or yarn 1.22+
- Git for version control
- Supabase account for backend services

### Local Development
1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/GEMDevEng/MicroSite-Forge.git
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

## 📝 Coding Standards

### Code Style
- **TypeScript**: Use strict mode and proper typing
- **ESLint**: Follow Next.js recommended rules
- **Prettier**: Automatic code formatting (configured)
- **File Naming**: Use kebab-case for files, PascalCase for components

### Code Organization
- **Components**: Place in `/components` with proper folder structure
- **Utilities**: Place in `/lib` or `/utils`
- **Types**: Define in `/types` or co-located with components
- **Tests**: Place alongside source files with `.test.ts` extension

### Documentation Standards
- **Code Comments**: Use JSDoc for functions and complex logic
- **README Updates**: Update relevant README files for new features
- **API Documentation**: Document all API endpoints and parameters
- **Type Documentation**: Provide clear type definitions and examples

## 🧪 Testing Requirements

### Test Coverage
- **Minimum Coverage**: 80% for all new code
- **Unit Tests**: Required for all utility functions and components
- **Integration Tests**: Required for API endpoints
- **E2E Tests**: Required for critical user flows

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Writing Tests
- **Test Files**: Use `.test.ts` or `.spec.ts` extensions
- **Test Structure**: Follow Arrange-Act-Assert pattern
- **Mocking**: Use appropriate mocks for external dependencies
- **Assertions**: Use descriptive test names and clear assertions

## 🔄 Pull Request Process

### Before Submitting
1. **Create a feature branch** from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Run the test suite** to ensure everything passes
6. **Check code formatting** with Prettier and ESLint

### Pull Request Guidelines
1. **Clear Title**: Use descriptive titles following conventional commits
2. **Detailed Description**: Explain what changes were made and why
3. **Link Issues**: Reference related issues using GitHub keywords
4. **Screenshots**: Include screenshots for UI changes
5. **Breaking Changes**: Clearly document any breaking changes

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] Tests added for new functionality
```

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues** to avoid duplicates
2. **Check the latest version** to see if the bug is already fixed
3. **Reproduce the issue** with minimal steps

### Bug Report Template
```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]
- Node.js version: [e.g. 20.6.0]

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

### Before Requesting
1. **Check existing issues** and discussions
2. **Consider the scope** and alignment with project goals
3. **Think about implementation** and potential challenges

### Feature Request Template
```markdown
## Feature Description
A clear and concise description of the feature you'd like to see.

## Problem Statement
Describe the problem this feature would solve.

## Proposed Solution
Describe the solution you'd like to see implemented.

## Alternatives Considered
Describe any alternative solutions you've considered.

## Additional Context
Add any other context, mockups, or examples about the feature request.
```

## 📚 Documentation Contributions

### Documentation Types
- **User Guides**: Help users understand how to use the application
- **Developer Docs**: Technical documentation for contributors
- **API Documentation**: Endpoint and integration documentation
- **Architecture Docs**: System design and technical decisions

### Documentation Standards
- **Markdown**: Use standard Markdown formatting
- **Structure**: Follow existing documentation structure
- **Links**: Use relative links for internal documentation
- **Images**: Optimize images and use descriptive alt text
- **Examples**: Include practical examples and code snippets

## 🏷️ Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit messages:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples
```
feat: add AI-powered niche research integration
fix: resolve authentication token expiry issue
docs: update API documentation for lead endpoints
test: add unit tests for content generation
chore: update dependencies to latest versions
```

## 🎯 Project Priorities

### Current Focus Areas
1. **Core MVP Features**: Authentication, AI integration, lead processing
2. **Performance**: API response times, frontend optimization
3. **Testing**: Comprehensive test coverage
4. **Documentation**: User guides and technical documentation

### Future Priorities
1. **Advanced Features**: Multi-tenant support, advanced analytics
2. **Integrations**: Additional AI providers, communication channels
3. **Scalability**: Performance optimization, horizontal scaling
4. **User Experience**: UI/UX improvements, mobile optimization

## 📞 Getting Help

### Resources
- **[Documentation](docs/README.md)**: Comprehensive project documentation
- **[GitHub Issues](https://github.com/GEMDevEng/MicroSite-Forge/issues)**: Bug reports and feature requests
- **[GitHub Discussions](https://github.com/GEMDevEng/MicroSite-Forge/discussions)**: Community Q&A

### Contact
- **Email**: [contributors@micrositeforge.com](mailto:contributors@micrositeforge.com)
- **Discord**: Coming soon
- **Twitter**: [@MicroSiteForge](https://twitter.com/MicroSiteForge)

## 📄 License

By contributing to MicroSite Forge, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MicroSite Forge! Your contributions help make this project better for everyone. 🚀
