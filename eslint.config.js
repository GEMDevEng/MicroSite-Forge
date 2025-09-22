import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

// ESLint configuration for Next.js with TypeScript
const eslintConfig = [
  // Apply Next.js core and TypeScript rules
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next/typescript'),
  {
    rules: {
      // Allow 'any' type for development flexibility
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused variables starting with underscore
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Allow require() in test files
      '@typescript-eslint/no-require-imports': 'off',
      // Allow empty interfaces (common in React components)
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
]

export default eslintConfig
