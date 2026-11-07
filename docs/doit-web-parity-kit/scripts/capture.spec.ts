// Playwright capture + audit. Usage:
//   BASE_URL=https://app.example.com E2E_EMAIL=alice@... E2E_PASSWORD=... npx playwright test scripts/capture.spec.ts
// Outputs: shots/<RUN>/<route>__<viewport>__<theme>__<accent>.png  and shots/<RUN>/report.json
// Assumptions to verify in V0: login form labels, route list, how theme/accent are stored (`data-accent` attr + `dark` class).
import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const RUN = process.env.RUN || new Date().toISOString().replace(/[:.]/g, '-');
const OUT = path.join('shots', RUN); fs.mkdirSync(OUT, { recursive: true });
const AUDIT = fs.readFileSync(path.join(__dirname, 'dom-audit.js'), 'utf8');

const ROUTES: Record<string, string> = {
  overview: '/w/demo/home', tasks: '/w/demo/tasks', bugs: '/w/demo/bugs', stickies: '/w/demo/stickies',
  settings_profile: '/w/demo/settings/profile', settings_appearance: '/w/demo/settings/appearance',
  settings_security: '/w/demo/settings/security', members: '/w/demo/settings/members',
}; // adjust to the real route table
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, laptop: { width: 1024, height: 768 }, mobile: { width: 390, height: 844 } };
const THEMES = ['dark', 'light'] as const;
const ACCENTS = ['blue', 'violet'] as const;
const report: any[] = [];

test.setTimeout(600_000);
test('capture + audit all pages', async ({ browser }) => {
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    for (const theme of THEMES) {
      for (const accent of ACCENTS) {
        const ctx = await browser.newContext({ viewport: vp, colorScheme: theme, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        await page.goto(process.env.BASE_URL + '/login');
        await page.getByLabel(/email/i).fill(process.env.E2E_EMAIL!);
        await page.getByLabel(/password/i).fill(process.env.E2E_PASSWORD!);
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await page.waitForLoadState('networkidle');
        await page.evaluate(([t, a]) => { document.documentElement.classList.toggle('dark', t === 'dark'); document.documentElement.dataset.accent = a; }, [theme, accent]);
        for (const [name, url] of Object.entries(ROUTES)) {
          await page.goto(process.env.BASE_URL + url); await page.waitForLoadState('networkidle');
          await page.evaluate(([t, a]) => { document.documentElement.classList.toggle('dark', t === 'dark'); document.documentElement.dataset.accent = a; }, [theme, accent]);
          await page.waitForTimeout(400);
          const key = `${name}__${vpName}__${theme}__${accent}`;
          await page.screenshot({ path: path.join(OUT, key + '.png'), fullPage: true });
          const dom = await page.evaluate(`(${AUDIT})()`);
          const axe = await new AxeBuilder({ page }).analyze();
          report.push({ key, dom, axe: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })) });
        }
        await ctx.close();
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  // cross-page container consistency (desktop/dark/blue): all data pages should share one content width
  const widths = report.filter(r => r.key.includes('__desktop__dark__blue')).map(r => {
    const m = r.dom.find((d: any) => d.code === 'LAYOUT_METRICS'); return m ? { page: r.key.split('__')[0], ...JSON.parse(m.msg) } : null; }).filter(Boolean);
  fs.writeFileSync(path.join(OUT, 'layout-widths.json'), JSON.stringify(widths, null, 2));
  const distinct = [...new Set(widths.map((w: any) => Math.round(w.contentW / 16)))];
  if (distinct.length > 3) console.log(`WARN INCONSISTENT_CONTAINER: ${distinct.length} different content widths across pages — see layout-widths.json`);
  const errors = report.flatMap(r => r.dom.filter((d: any) => d.sev === 'ERROR').map((d: any) => ({ page: r.key, ...d })));
  const serious = report.flatMap(r => r.axe.filter((v: any) => ['serious', 'critical'].includes(v.impact)).map((v: any) => ({ page: r.key, ...v })));
  console.log(`DOM ERRORs: ${errors.length}  axe serious/critical: ${serious.length}  → ${OUT}/report.json`);
});
