// Polyfill Response.json for Node test environment
if (!(Response as any).json) {
  ;(Response as any).json = (data: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
  }
}
