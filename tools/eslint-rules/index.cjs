// Local ESLint plugin entry (CommonJS) so it can be required from the ESM config
const rule = require('./no-untyped-dom-access.cjs');

module.exports = {
  rules: {
    'no-untyped-dom-access': rule,
  },
};
