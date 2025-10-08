// valid.ts - explicitly typed input usage and event target usage
const input: HTMLInputElement = document.createElement('input') as HTMLInputElement;
const v = (input as HTMLInputElement).value;

function onInput(e: Event) {
  const t = e.target as HTMLInputElement;
  console.log((t as HTMLInputElement).value);
}

export {};
