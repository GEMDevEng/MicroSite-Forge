// Safe coverage extractor: prints numeric percentage (lines) or 0
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const p = path.resolve(__dirname, '..', 'coverage', 'coverage-summary.json');
  if (!fs.existsSync(p)) {
    console.log('0');
    process.exit(0);
  }
  const raw = fs.readFileSync(p, 'utf8');
  const json = JSON.parse(raw);
  const pct = ((json && json.total && json.total.lines && json.total.lines.pct) || 0);
  // Ensure numeric
  const num = Number(pct) || 0;
  // Print without extra decoration so shell can parse it
  console.log(num);
  process.exit(0);
} catch (err) {
  // On any error, print 0 to avoid failing the workflow
  console.error('Could not read coverage summary:', err && err.message ? err.message : err);
  console.log('0');
  process.exit(0);
}
