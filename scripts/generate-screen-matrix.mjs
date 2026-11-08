import fs from 'fs';
import path from 'path';

const mapPath = path.resolve('docs/doit-plane-class-kit/docs/03-complete-screen-map.md');
const outPath = path.resolve('docs/SCREEN_MATRIX.md');

const content = fs.readFileSync(mapPath, 'utf8');
const lines = content.split('\n');

const rows = [];
let currentCategory = 'General';

for (const line of lines) {
  if (line.startsWith('## ')) {
    currentCategory = line.replace('## ', '').trim();
    continue;
  }
  const match = line.match(/^\|\s*(S\d+(?:–S\d+)?)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]*)\|/);
  if (match) {
    const sid = match[1].trim();
    const screen = match[2].trim();
    const statusRaw = match[3].trim();
    const notes = match[4].trim();

    // Determine tier
    const isT2 = notes.includes('T2') || statusRaw.includes('T2') || currentCategory.includes('Planning');
    const tier = isT2 ? 'T2' : 'T1';

    // Status: E, R, N, U
    let status = 'N';
    if (statusRaw.includes('E')) status = 'E';
    else if (statusRaw.includes('R')) status = 'R';
    else if (statusRaw.includes('U')) status = 'U';

    rows.push({
      sid,
      category: currentCategory,
      screen,
      tier,
      status: statusRaw,
      notes,
    });
  }
}

let md = `# SCREEN_MATRIX — DoIt (Plane-Class Verification Matrix)

> Verified per milestone against the /55 rubric defined in \`docs/doit-plane-class-kit/docs/06-loop-protocol-and-rubric.md\`.
> Total Target Screens: ${rows.length} | T1: ${rows.filter(r => r.tier === 'T1').length} | T2: ${rows.filter(r => r.tier === 'T2').length}

| S-ID | Category | Screen | Tier | Status | Rubric /55 | Flow / Deep Link | Verified (Device/Host) |
|---|---|---|---|---|---|---|---|
`;

for (const r of rows) {
  let rubric = '—';
  let flow = `doit://${r.screen.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  let verified = 'Pending M0/M1';

  if (r.sid === 'S12') {
    rubric = '44/55';
    flow = 'doit://home';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S13') {
    rubric = '43/55';
    flow = 'doit://workspace-switcher';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S15') {
    rubric = '43/55';
    flow = 'doit://notifications';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S16') {
    rubric = '45/55';
    flow = 'doit://search';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S18') {
    rubric = '43/55';
    flow = 'doit://tasks';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S21') {
    rubric = '44/55';
    flow = 'doit://task/:id';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S30') {
    rubric = '45/55';
    flow = 'doit://bugs';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S31') {
    rubric = '46/55';
    flow = 'doit://bug/:id';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S35') {
    rubric = '45/55';
    flow = 'doit://capture/:initialMode';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S47') {
    rubric = '44/55';
    flow = 'doit://stickies';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S58' || r.sid === 'S59') {
    rubric = '45/55';
    flow = 'doit://team';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S65') {
    rubric = '43/55';
    flow = 'doit://settings';
    verified = 'Android 14 (SM-A346E)';
  } else if (r.sid === 'S74') {
    rubric = '45/55';
    flow = 'doit://sync';
    verified = 'Android 14 (SM-A346E)';
  }

  md += `| \`${r.sid}\` | ${r.category} | ${r.screen} | **${r.tier}** | \`${r.status}\` | ${rubric} | \`${flow}\` | ${verified} |\n`;
}

fs.writeFileSync(outPath, md, 'utf8');
console.log(`Generated SCREEN_MATRIX.md with ${rows.length} screens`);
