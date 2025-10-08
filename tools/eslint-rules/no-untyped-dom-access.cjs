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
        // Skip obvious safe patterns
        if (/\(.*as\s+HTMLInputElement\)|\.target|\bevent\b|\be\b/.test(objText)) return;

        // If parserServices available, try to use TypeScript type information
        var parserServices = context.parserServices;
        try {
          if (parserServices && parserServices.program) {
            var checker = parserServices.program.getTypeChecker();
            var tsNode = parserServices.esTreeNodeToTSNodeMap && parserServices.esTreeNodeToTSNodeMap.get(node.object);
            if (tsNode) {
              var type = checker.getTypeAtLocation(tsNode);
              var typeStr = checker.typeToString(type);
              // If the type clearly includes HTMLInputElement or other input-like elements, consider safe
              if (/HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|HTMLFormElement/.test(typeStr)) return;
              // If the type is explicit 'any' or 'unknown', skip reporting
              if (/any|unknown/.test(typeStr)) return;
              // If union includes HTMLInputElement, safe
              if (/HTMLInputElement/.test(typeStr)) return;
              // Otherwise, report — the type doesn't look like an input element
              context.report({ node: node, message: "Possible untyped DOM access (type: " + typeStr + "): '" + objText + "." + prop + "'" });
              return;
            }
          }
        } catch (e) {
          // On any parser service error, fall back to heuristic
        }

        // Fallback heuristic
        context.report({ node: node, message: "Possible untyped DOM access: '" + objText + "." + prop + "'" });
      }
    };
  }
};
