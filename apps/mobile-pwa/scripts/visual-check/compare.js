// Compares two capture folders pixel by pixel. Usage: node compare.js <before-dir> <after-dir> <diff-dir>
// Exits non-zero if any page differs, so it can gate a release.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const [before, after, diffDir] = process.argv.slice(2);
if (!before || !after || !diffDir) { console.error('usage: node compare.js <before-dir> <after-dir> <diff-dir>'); process.exit(2); }
fs.mkdirSync(diffDir, { recursive: true });
let failed = 0;
for (const f of fs.readdirSync(before).filter(x => x.endsWith('.png'))) {
  const a = PNG.sync.read(fs.readFileSync(path.join(before, f)));
  if (!fs.existsSync(path.join(after, f))) { console.log(`${f}: MISSING in after`); failed++; continue; }
  const b = PNG.sync.read(fs.readFileSync(path.join(after, f)));
  if (a.width !== b.width || a.height !== b.height) { console.log(`${f}: SIZE DIFFERS ${a.width}x${a.height} vs ${b.width}x${b.height}`); failed++; continue; }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  fs.writeFileSync(path.join(diffDir, f), PNG.sync.write(diff));
  console.log(`${f}: ${n} pixels differ`);
  if (n > 0) failed++;
}
console.log(failed ? `FAILED: ${failed} page(s) differ` : 'PASSED: all pages identical');
process.exit(failed ? 1 : 0);
