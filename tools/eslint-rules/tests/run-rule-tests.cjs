const { ESLint } = require('eslint');
const path = require('path');

async function run() {
  const plugin = require('../index.cjs');
  const eslint = new ESLint({
    overrideConfig: {
      languageOptions: {
        parser: require('@typescript-eslint/parser'),
        parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
      },
      plugins: { 'local-rules': plugin },
      rules: { 'local-rules/no-untyped-dom-access': 'error' },
    },
  });

  const validSamples = [
    'const v = (el as HTMLInputElement).value; console.log(v);',
    'const v = e.target.value; console.log(v);',
  'const v = (input as HTMLInputElement).value; console.log(v); // already typed',
  ];
  const invalidSamples = [
    'const v = node.value;'
  ];

  for (const code of validSamples) {
    const results = await eslint.lintText(code, { filePath: path.resolve('test.ts') });
    const errCount = results.reduce((s, r) => s + r.errorCount, 0);
    if (errCount > 0) {
      console.error('Valid sample unexpectedly produced errors:', code, results[0].messages);
      process.exit(2);
    }
  }

  for (const code of invalidSamples) {
    const results = await eslint.lintText(code, { filePath: path.resolve('test.ts') });
    const errCount = results.reduce((s, r) => s + r.errorCount, 0);
    if (errCount === 0) {
      console.error('Invalid sample did not produce errors as expected:', code, results[0].messages);
      process.exit(2);
    }
  }

  console.log('ESLint rule smoke tests passed');
}

run().catch((err) => { console.error(err); process.exit(2); });

