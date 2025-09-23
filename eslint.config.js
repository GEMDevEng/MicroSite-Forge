import { fixupConfigRules, fixupPluginRules } from "@eslint/eslintrc";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";

export default [
  {
    name: "ignores",
    ignores: ["**/dist/**", "**/node_modules/**", "**/build/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Allow 'any' type for development flexibility
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused variables starting with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_" }
      ],
      // Allow require() in test files
      "@typescript-eslint/no-require-imports": "off",
      // Allow empty interfaces (common in React components)
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
