#!/usr/bin/env node
const { execSync } = require('child_process')
const patterns = ["\\$eval\\(", "page\\.\\$eval", "document.querySelector\\(.*\\)\\.value"]
let found = false

for (const p of patterns) {
  try {
    const out = execSync(`git grep -n -- "${p}" || true`, { encoding: 'utf8' })
    if (out && out.trim()) {
      console.log(`Found pattern ${p}:\n${out}`)
      found = true
    }
  } catch (err) {
    // ignore
  }
}

if (found) {
  console.error('Potential untyped DOM access patterns found. Please review and cast elements or use Playwright typed APIs.')
  process.exit(2)
}
console.log('No untyped DOM access patterns detected.')
process.exit(0)
