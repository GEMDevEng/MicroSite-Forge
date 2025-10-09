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
  // Skip obvious safe patterns (explicit cast or event targets)
  if (/as\s+HTMLInputElement|as\s+HTMLTextAreaElement|\.target|\bevent\b|\be\b/.test(objText)) return;

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

        // If parserServices didn't yield a TS node, try to find a declaration in scope
        function checkIdentifierName(name) {
          try {
            var scope = context.getScope();
            while (scope) {
              var v = scope.variables && scope.variables.find(function (vv) { return vv.name === name; });
              if (v && v.defs && v.defs.length) {
                var def = v.defs[0];
                if (def.node && def.node.id && def.node.id.typeAnnotation) {
                  var ta = context.getSourceCode().getText(def.node.id.typeAnnotation);
                  if (/HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement/.test(ta)) return true;
                }
                // Check initializer text for explicit cast or createElement
                if (def.node && def.node.init) {
                  var initText = context.getSourceCode().getText(def.node.init);
                  if (/as\s+HTMLInputElement|createElement\(\s*['"]input['"]\s*\)/.test(initText)) return true;
                  // detect useRef initializer patterns: useRef<...HTMLInputElement...>(null)
                  if (/useRef\s*<[^>]*HTMLInputElement[^>]*>/.test(initText)) return true;
                }
              }
              scope = scope.upper;
            }
          } catch (e) {
            // ignore scope lookup errors
          }
          return false;
        }

        if (node.object && node.object.type === 'Identifier') {
          try {
            var name = node.object.name;
            if (checkIdentifierName(name)) return;
          } catch (e) {
            // ignore scope lookup errors
          }
        }
        // Fallback: inspect raw source for patterns like "const el = document.querySelector<HTMLInputElement>(...)" or "const ref = useRef<HTMLInputElement>..."
        try {
          var baseIdentifier = null;
          if (node.object && node.object.type === 'Identifier') baseIdentifier = node.object.name;
          if (node.object && node.object.type === 'MemberExpression' && node.object.object && node.object.object.type === 'Identifier') baseIdentifier = node.object.object.name;
          if (baseIdentifier) {
            var fullSrc = context.getSourceCode().getText();
            var qre = new RegExp('\\b' + baseIdentifier + '\\s*=\\s*document\\.querySelector\\s*<[^>]*HTMLInputElement[^>]*>', 'm');
            var rre = new RegExp('\\b' + baseIdentifier + '\\s*=\\s*useRef\\s*<[^>]*HTMLInputElement[^>]*>', 'm');
            if (qre.test(fullSrc) || rre.test(fullSrc)) return;
          }
        } catch (e) {
          // ignore
        }
        // If the member expression is like ref.current.value, try parserServices on the base, then fall back to looking up the base identifier 'ref'
        if (node.object && node.object.type === 'MemberExpression') {
          try {
            var ps = context.parserServices;
            if (ps && ps.program) {
              var tsBase = null;
              try {
                tsBase = ps.esTreeNodeToTSNodeMap && ps.esTreeNodeToTSNodeMap.get(node.object.object || node.object);
              } catch (e) {
                tsBase = null;
              }
              if (tsBase) {
                try {
                  var baseType = ps.program.getTypeChecker().getTypeAtLocation(tsBase);
                  var baseTypeStr = ps.program.getTypeChecker().typeToString(baseType);
                  if (/HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement/.test(baseTypeStr)) return;
                } catch (e) {
                  // ignore
                }
              }
            }
          } catch (e) {
            // ignore
          }
          if (node.object.object && node.object.object.type === 'Identifier') {
            try {
              var baseName = node.object.object.name;
              if (checkIdentifierName(baseName)) return;
            } catch (e) {
              // ignore
            }
          }
        }

        // Additional heuristics: check for querySelector generic or as-cast on chained member expression
        try {
          if (node.object && node.object.type === 'CallExpression') {
            var callText = context.getSourceCode().getText(node.object);
            // document.querySelector<HTMLInputElement>(...) or (document.querySelector('#x') as HTMLInputElement)
            if (/querySelector\s*<[^>]*HTMLInputElement[^>]*>/.test(callText) || /querySelector\([^)]*\)\s*as\s*HTMLInputElement/.test(callText)) return;
            // Also try parserServices for call expression return type
            try {
              var ps = context.parserServices;
              if (ps && ps.program) {
                var tsNodeCall = ps.esTreeNodeToTSNodeMap && ps.esTreeNodeToTSNodeMap.get(node.object);
                if (tsNodeCall) {
                  var callType = ps.program.getTypeChecker().getTypeAtLocation(tsNodeCall);
                  var callTypeStr = ps.program.getTypeChecker().typeToString(callType);
                  if (/HTMLInputElement/.test(callTypeStr)) return;
                }
              }
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }

        // Fallback heuristic
        context.report({ node: node, message: "Possible untyped DOM access: '" + objText + "." + prop + "'" });
      }
    };
  }
};
