// invalid.ts - untyped DOM access should be flagged
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Here 'node' is inferred as Element | SVGElement (simulating union)
declare const node: Element;
const v = (node as any).value; // intentionally wrong but typed any; rule should either skip or flag depending on logic

// Untyped querySelector return
const el = document.querySelector('#foo');
// No cast here - should be flagged by the rule
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const vv = el.value;

export {};
