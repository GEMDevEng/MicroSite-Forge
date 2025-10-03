// Polyfill Response.json for Node test environment
declare global {
  interface Response {
    json?: (data: unknown, init?: ResponseInit) => Response
  }
}

  if (!(Response as unknown as typeof globalThis & { json?: unknown }).json) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  ;(Response as unknown as any).json = (data: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
  }
}
