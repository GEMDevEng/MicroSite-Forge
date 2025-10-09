// react-patterns.tsx - fixtures for React-specific patterns
import React, { useRef } from 'react';

export function WithRef() {
  const ref = useRef<HTMLInputElement | null>(null);
  // Access via ref.current.value should be considered safe when typed
  const v = ref.current?.value;
  return <input ref={ref} />;
}

export function QueryGeneric() {
  const el = document.querySelector<HTMLInputElement>('#foo');
  // should be considered safe due to generic
  const v = el?.value;
  return null as any;
}

export function OnChange(e: React.ChangeEvent<HTMLInputElement>) {
  // event target typed
  console.log(e.target.value);
  return null as any;
}
