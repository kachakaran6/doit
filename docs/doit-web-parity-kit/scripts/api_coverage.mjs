#!/usr/bin/env node
/* API → UI coverage matrix.
 * Usage:
 *   node scripts/api_coverage.mjs --spec http://localhost:3000/docs-json --src apps/web/src [--waivers waivers.json] [--out docs/API_COVERAGE.md]
 *   node scripts/api_coverage.mjs --spec openapi.json --src apps/mobile/src --out docs/API_COVERAGE_MOBILE.md
 * For every operation in the OpenAPI spec, searches the client source for a call to that path (+method).
 * Heuristic (string/regex based): "covered" means a call site exists, not that the UI is good. Exit code 1 if uncovered ops remain after waivers.
 * waivers.json: [{ "op": "POST /auth/ws-ticket", "reason": "used by the realtime client only" }]  */
import fs from 'node:fs'; import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a, []));
if (!args.spec || !args.src) { console.error('need --spec <url|file> and --src <dir>'); process.exit(2); }

const load = async (s) => /^https?:/.test(s) ? await (await fetch(s)).json() : JSON.parse(fs.readFileSync(s, 'utf8'));
const spec = await load(args.spec);
const waivers = args.waivers && fs.existsSync(args.waivers) ? JSON.parse(fs.readFileSync(args.waivers, 'utf8')) : [];
const waived = new Map(waivers.map(w => [w.op.toUpperCase(), w.reason]));

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  if (['node_modules', 'dist', 'build', '.expo', '.git'].includes(e.name)) continue;
  const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|jsx?|mjs)$/.test(e.name) && !/\.(test|spec|d)\./.test(e.name)) files.push(p);
} })(args.src);
const sources = files.map(f => ({ f, t: fs.readFileSync(f, 'utf8') }));

const base = (spec.servers?.[0]?.url || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
const PARAM = "(?:\\$\\{[^}]+\\}|:[A-Za-z_][A-Za-z0-9_]*|\\{[A-Za-z_][A-Za-z0-9_]*\\}|[^/'\"`\\s?)]+)";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const METHOD_RX = { get: /(\.get\b|method:\s*['"`]GET|\bGET\b)/i, post: /(\.post\b|method:\s*['"`]POST|\bPOST\b)/i, put: /(\.put\b|method:\s*['"`]PUT|\bPUT\b)/i, patch: /(\.patch\b|method:\s*['"`]PATCH|\bPATCH\b)/i, delete: /(\.delete\b|\.del\b|method:\s*['"`]DELETE|\bDELETE\b)/i };

const ops = [];
for (const [p, item] of Object.entries(spec.paths || {}))
  for (const m of ['get', 'post', 'put', 'patch', 'delete']) if (item[m]) ops.push({ method: m, path: p, tag: (item[m].tags || ['other'])[0], summary: item[m].summary || item[m].operationId || '', opId: item[m].operationId });

const rows = [];
for (const op of ops) {
  const rel = op.path.replace(new RegExp('^' + esc(base)), '');
  const segs = rel.split('/').filter(Boolean).map(s => /^\{.+\}$/.test(s) ? PARAM : esc(s));
  const pathRx = new RegExp("['\"`]\\/?(?:api\\/v1\\/)?" + segs.join('\\/') + "(?:['\"`?/]|\\$\\{)", 'g');
  const hits = new Set();
  for (const { f, t } of sources) {
    let m; pathRx.lastIndex = 0;
    while ((m = pathRx.exec(t))) {
      const win = t.slice(Math.max(0, m.index - 120), m.index + 220);
      const others = Object.entries(METHOD_RX).filter(([k]) => k !== op.method && METHOD_RX[k].test(win)).length;
      if (METHOD_RX[op.method].test(win) || (op.method === 'get' && others === 0)) { hits.add(f); break; }
    }
    if (!hits.has(f) && op.opId && new RegExp('\\b' + esc(op.opId) + '\\b').test(t)) hits.add(f);
  }
  const key = `${op.method.toUpperCase()} ${rel}`;
  rows.push({ ...op, key, covered: hits.size > 0, files: [...hits].slice(0, 3), waived: waived.get(key.toUpperCase()) });
}
const unc = rows.filter(r => !r.covered && !r.waived);
const pct = rows.length ? Math.round(100 * rows.filter(r => r.covered || r.waived).length / rows.length) : 100;

let md = `# API → UI coverage (${new Date().toISOString().slice(0, 10)})\n\nSpec: \`${args.spec}\` · Source: \`${args.src}\` · **${pct}%** covered or waived (${rows.length} operations, ${unc.length} uncovered)\n\n`;
const byTag = rows.reduce((a, r) => ((a[r.tag] ||= []).push(r), a), {});
for (const [tag, list] of Object.entries(byTag)) {
  md += `## ${tag}\n| Operation | Summary | UI | Where |\n|---|---|---|---|\n`;
  for (const r of list) md += `| \`${r.key}\` | ${r.summary} | ${r.covered ? '✅' : r.waived ? '⚪ waived' : '❌'} | ${r.covered ? r.files.map(f => path.relative(process.cwd(), f)).join('<br>') : (r.waived || '')} |\n`;
  md += '\n';
}
if (args.out) { fs.mkdirSync(path.dirname(args.out), { recursive: true }); fs.writeFileSync(args.out, md); }
fs.writeFileSync((args.out || 'api-coverage').replace(/\.md$/, '') + '.json', JSON.stringify(rows, null, 2));
console.log(`coverage ${pct}%  (${rows.length - unc.length}/${rows.length})  uncovered=${unc.length}`);
for (const r of unc) console.log(`  ✗ ${r.key}  [${r.tag}] ${r.summary}`);
process.exit(unc.length ? 1 : 0);
