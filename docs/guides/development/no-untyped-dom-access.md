# no-untyped-dom-access ESLint rule

This project enforces a custom ESLint rule `local-rules/no-untyped-dom-access` that prevents unsafe access to DOM-specific properties (for example, `.value`, `.checked`, or `.files`) on values that are typed as wide DOM unions like `HTMLElement | SVGElement | Element | null`.

Why
- Newer TypeScript and DOM typings can widen element types (for example `HTMLElement | SVGElement`). Accessing properties like `.value` without narrowing can cause TypeScript errors and runtime bugs.

What the rule enforces
- Disallow accessing DOM-specific properties directly on un-narrowed or `any`/`unknown` typed values.
- Encourage explicit narrowing (type guards, instanceof checks, or helper functions) or using strongly-typed adapters (for example, typed cookie helpers or fetch wrappers).

How to fix violations (quick guide)
1. Narrow the element type before property access

```ts
// Bad
const el: Element | null = document.querySelector('#name');
console.log(el.value); // Error: Property 'value' does not exist on type 'Element'

// Good - type guard
if (el instanceof HTMLInputElement) {
  console.log(el.value);
}
```

2. Use typed controller adapters in forms (for react-hook-form controllers)

```ts
// Ensure `options` are typed as { label: string; value: string }[]
```

3. Centralize untyped JSON responses and assert a typed shape in a single place (see `src/lib/api-client.ts` for an example).

4. For server-side adapters (cookies, headers), create a small typed adapter that implements the expected interface rather than casting to `any`.

Notes
- Tests are allowed to use controlled `any` where the test harness intentionally simulates browser behavior; prefer keeping these exceptions localized to test files and clearly documented.
- If you need help migrating a violation, open a PR and tag `@GEMDevEng/core` for review.

---
Generated on: 2025-10-09
