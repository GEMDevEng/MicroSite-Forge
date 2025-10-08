/*
  Basic TypeScript AST scanner to find suspicious DOM access patterns that can cause union-type issues,
  e.g., calling `.value` or `.checkValidity()` on a Node that could be SVGElement | HTMLElement.

  This scanner searches for MemberExpression nodes where the property is `value` or `checkValidity`
  and attempts to trace the identifier back to a querySelector/$eval/locator where the type might be a generic Element.

  This is a lightweight heuristic scanner — we'll follow up with an ESLint rule for deeper checks.
*/

const ts = require('typescript');
const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern = /\.tsx?$|\.ts$/i) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      out.push(...findFiles(p, pattern));
    } else if (pattern.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

function scanFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, src, ts.ScriptTarget.ESNext, true);
  const findings = [];

  function visit(node) {
    // member access like something.value or something.checkValidity()
    if (ts.isPropertyAccessExpression(node)) {
      const name = node.name.getText(sourceFile);
      if (name === 'value' || name === 'checkValidity') {
        const exprText = node.expression.getText(sourceFile);
        findings.push({ file: filePath, line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1, text: exprText + '.' + name });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

function runScan() {
  const files = findFiles(process.cwd());
  const all = [];
  for (const f of files) {
    try {
      const r = scanFile(f);
      if (r.length) all.push(...r);
    } catch (err) {
      console.error('Error scanning', f, err && err.message);
    }
  }
  if (all.length) {
    console.log('Potential untyped DOM access patterns found:');
    for (const a of all) {
      console.log(`${a.file}:${a.line} -> ${a.text}`);
    }
    console.log('\nThis is a heuristic scanner. Consider replacing with an ESLint rule (typescript-eslint) for precise checks.');
    process.exit(2);
  }
  console.log('No suspicious DOM access patterns found by scanner.');
  process.exit(0);
}

runScan();
