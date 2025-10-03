// Polyfill Response.json for Node test environment without altering TypeScript DOM typings
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
if (!('json' in Response.prototype)) {
  ;(Response.prototype as any).json = async function () {
    try {
      const text = await this.text()
      return JSON.parse(text)
    } catch (_err) {
      return this
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

export {}
