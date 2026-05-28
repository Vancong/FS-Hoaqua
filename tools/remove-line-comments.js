/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  path.join(ROOT, 'HocPhan', 'Fe', 'src'),
  path.join(ROOT, 'HocPhan', 'Be', 'src'),
];

const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.scss', '.css']);
const LINE_COMMENT_RE = /^\s*\/\/.*$/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === 'build') continue;
      walk(p, out);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (ALLOWED_EXT.has(ext)) out.push(p);
    }
  }
  return out;
}

function normalizeNewlines(s) {
  // Preserve file's dominant newline style if possible
  const crlf = (s.match(/\r\n/g) || []).length;
  const lf = (s.match(/(?<!\r)\n/g) || []).length;
  return crlf > lf ? '\r\n' : '\n';
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const nl = normalizeNewlines(raw);
  const lines = raw.split(/\r\n|\n/);
  const filtered = lines.filter((line) => !LINE_COMMENT_RE.test(line));
  if (filtered.length === lines.length) return false;
  fs.writeFileSync(filePath, filtered.join(nl), 'utf8');
  return true;
}

function main() {
  const files = TARGETS.flatMap((t) => walk(t));
  let changed = 0;
  for (const f of files) {
    try {
      if (processFile(f)) changed++;
    } catch (err) {
      console.warn('Skip', f, err.message);
    }
  }
  console.log(`Done. Updated ${changed} files.`);
}

main();

