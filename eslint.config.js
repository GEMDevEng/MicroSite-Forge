import js from '@eslint/js'
import typescriptEslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import nextPlugin from '@next/eslint-plugin-next'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const localRules = require('./tools/eslint-rules/index.cjs')

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      'eslint.config.js',
      '**/*.config.js',
      '**/jest.config.cjs',
      '**/jest.integration.config.cjs',
      '**/jest.setup.js',
      '**/postcss.config.cjs',
      '**/tailwind.config.js',
      'scripts/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    files: ['newrelic.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        exports: 'readonly',
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      '@next/next': nextPlugin,
      'local-rules': localRules,
    },
    rules: {
      // Next.js recommended rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // Custom rules
      // Allow 'any' type for development flexibility
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused variables starting with underscore
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Allow require() in test files
      '@typescript-eslint/no-require-imports': 'off',
      // Allow empty interfaces (common in React components)
      '@typescript-eslint/no-empty-object-type': 'off',
      // Local rule to catch untyped DOM access patterns
      'local-rules/no-untyped-dom-access': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
]
