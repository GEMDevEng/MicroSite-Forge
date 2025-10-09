// Polyfill Response.json for Node test environment without altering TypeScript DOM typings
// Allow `any` here: this is a test polyfill and many callers expect `response.json()` to return `any`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Response {
    json(): Promise<any>
  }
}

if (!('json' in Response.prototype)) {
  // Provide a minimal `json` polyfill for Node test environment. Use
  // declaration merging so we augment the global Response type's `json`
  // method signature without breaking the DOM types.

  ;(Response.prototype as unknown as Response).json = async function () {
    try {
      const text = await this.text()
      return JSON.parse(text) as unknown
    } catch {
      return this as unknown
    }
  }
}

export {}
