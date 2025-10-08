/**
 * ESLint rule: no-untyped-dom-access
 * Flags member access of `.value` or `.checkValidity()` where the expression text looks untyped.
 * This is a heuristic rule; a follow-up will use type information from TypeScript.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow untyped DOM access that may be unsafe for union DOM types',
    },
    schema: [],
  },
  create: function (context) {
    return {
      'MemberExpression[property.name=/^(value|checkValidity)$/]': function (node) {
        var prop = node.property && node.property.name ? node.property.name : null;
        if (!prop) return;
        var objText = context.getSourceCode().getText(node.object);
        if (/\(.*as\s+HTMLInputElement\)|\.target|\bevent\b|\be\b/.test(objText)) return;
        context.report({ node: node, message: "Possible untyped DOM access: '" + objText + "." + prop + "'" });
      }
    };
  }
};
