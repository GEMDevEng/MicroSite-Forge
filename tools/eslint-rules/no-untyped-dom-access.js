/**
 * ESLint rule: no-untyped-dom-access
 * Flags member access of `.value` or `.checkValidity()` where the expression type is not a known HTMLInputElement-like identifier.
 * This is a minimal proof-of-concept rule using AST heuristics. We'll rely on the TypeScript type information in a follow-up iteration.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow untyped DOM access that may be unsafe for union DOM types',
    },
    schema: [],
  },
  create(context) {
    return {
      'MemberExpression[property.name=/^(value|checkValidity)$/]': function (node) {
        const prop = node.property && node.property.name ? node.property.name : null;
        if (!prop) return;
        // Heuristic: if the object expression text contains 'target' or 'e.' or 'event' or explicit cast, skip
        const objText = context.getSourceCode().getText(node.object);
        if (/\(.*as\s+HTMLInputElement\)|\.target|\bevent\b|\be\b/.test(objText)) return;
        context.report({ node, message: `Possible untyped DOM access: \'${objText}.${prop}\'` });
      }
    };
  }
};
