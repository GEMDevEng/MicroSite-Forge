const { ESLint } = require('eslint');
const path = require('path');

async function run() {
  const plugin = require('../index.cjs');
  const eslint = new ESLint({
    overrideConfig: {
      languageOptions: {
          parser: require('@typescript-eslint/parser'),
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            project: path.resolve(__dirname, 'tsconfig.json'),
            tsconfigRootDir: path.resolve(__dirname),
          },
        },
      plugins: { 'local-rules': plugin },
      rules: {
        'local-rules/no-untyped-dom-access': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        '@next/next/no-html-link-for-pages': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    cwd: path.resolve(__dirname),
    ignore: false,
  });

  // Lint on-disk fixtures so parserServices are available
  const testDir = path.resolve(__dirname, 'fixtures');
  const validFile = path.join(testDir, 'valid.ts');
  const invalidFile = path.join(testDir, 'invalid.ts');
  const reactPatterns = path.join(testDir, 'react-patterns.tsx');

  // Run lint on valid file
  const resValid = await eslint.lintFiles([validFile]);
  const validErrCount = resValid.reduce((s, r) => s + r.errorCount, 0);
  if (validErrCount > 0) {
    console.error('Valid fixture produced errors', resValid.map(r => r.messages));
    process.exit(2);
  }

  // Run lint on invalid file
  const resInvalid = await eslint.lintFiles([invalidFile]);
  const invalidErrCount = resInvalid.reduce((s, r) => s + r.errorCount, 0);
  if (invalidErrCount === 0) {
    console.error('Invalid fixture did not produce errors as expected', resInvalid.map(r => r.messages));
    process.exit(2);
  }

  // Run lint on react patterns fixture (should be OK)
  const resReact = await eslint.lintFiles([reactPatterns]);
  const reactErrCount = resReact.reduce((s, r) => s + r.errorCount, 0);
  if (reactErrCount > 0) {
    console.error('React patterns fixture produced errors', resReact.map(r => r.messages));
    process.exit(2);
  }

  console.log('ESLint rule smoke tests passed');
}

run().catch((err) => { console.error(err); process.exit(2); });

