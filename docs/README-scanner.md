DOM Access Scanner

This repository includes a lightweight TypeScript AST-based scanner that heuristically detects potentially untyped DOM access patterns which may cause TypeScript errors when DOM union types are involved (for example, `SVGElement | HTMLElement`).

Files
- `scripts/scan-dom-access.cjs` — a heuristic TypeScript AST scanner. It reports occurrences of `.value` and `.checkValidity()` property accesses and prints the file and line number.

Usage

Run the scanner from the repository root:

```bash
npm run check:dom-scanner
```

Behavior
- If the scanner finds matches it will exit with a non-zero code (2) and print each finding with file and line number.
- The scanner is intentionally conservative and heuristic. It may report valid code (for example `e.target.value` in React event handlers or explicit casts like `(el as HTMLInputElement).value`).

Recommended next steps when scanner reports findings
- Inspect each finding and decide whether it needs a fix:
  - If the value access is guarded or the element is already typed (explicit cast), no action is needed.
  - If the access may be performed on a union DOM element, prefer using a typed API (e.g. Playwright's `locator.inputValue()` or `locator.evaluate(el => (el as HTMLInputElement).value)`), or add an explicit cast to `HTMLInputElement` when safe.

Planned improvements
- Replace this heuristic scanner with an ESLint rule implemented via `@typescript-eslint` for precise static analysis and automatic fixer suggestions. See `feat/eslint-dom-rule` (planned) for the target branch.

Contact
- If you want me to implement the ESLint rule and tests, I can create `feat/eslint-dom-rule`, implement the rule, add tests, and open a PR.