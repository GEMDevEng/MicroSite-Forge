const { RuleTester } = require('eslint');
const rule = require('../no-untyped-dom-access.cjs');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

tester.run('no-untyped-dom-access', rule, {
  valid: [
    "(el as HTMLInputElement).value",
    "e.target.value",
    "input.value // already typed",
  ],
  invalid: [
    {
      code: 'const v = node.value;',
      errors: [{ message: /Possible untyped DOM access/ }]
    }
  ]
});

console.log('Rule tests executed');
