#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const p = path.resolve(process.cwd(), 'coverage/coverage-summary.json')
let pct = 0
if (fs.existsSync(p)) {
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'))
    pct = (data && data.total && data.total.lines && data.total.lines.pct) || 0
  } catch (e) {
    console.error('Failed to parse coverage-summary.json:', e.message)
    process.exit(0)
  }
}
console.log(pct)
process.exit(0)
