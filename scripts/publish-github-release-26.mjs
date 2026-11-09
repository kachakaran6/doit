import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

let TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  try {
    TOKEN = execSync('gh auth token').toString().trim();
  } catch (e) {
    console.error('No GITHUB_TOKEN set and gh auth token failed');
    process.exit(1);
  }
}

const REPO = 'kachakaran6/doit';
const TAG = 'v0.2.6+26';
const RELEASE_NAME = 'DoIt v0.2.6 — Build 26 (Status PATCH Fix, Header Padding Fix, Workspace/Profile Modal Fix, Metro Stability)';
const APK_SOURCE = 'K:/Doit/apps/mobile/android/app/build/outputs/apk/release/app-release.apk';
const APK_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.6-build26.apk';
const SHA_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.6-build26.apk.sha256';

const RELEASE_BODY = `## DoIt v0.2.6 — Release Build 26

### Critical Fixes & Improvements in Build 26:

1. **Status Update REST Route Fix (\`PATCH /api/v1/tasks/:id/status\`)**:
   - Fixed the NestJS controller routing regression where stacking \`@Post\` over \`@Patch\` erased the PATCH route handler.
   - Separated into two distinct, documented controller endpoints (\`updateStatusPatch\` and \`updateStatus\`), completely resolving the 404 "Cannot PATCH /api/v1/tasks/:id/status" error on task checkbox toggle.
   - All 20 API test suites and 76 test specs passing.

2. **Mobile Workspace Switcher & Profile Avatar Sheet Open Fix**:
   - Resolved the Android Modal crash/swallowed taps when opening the Workspace Switcher or Profile Avatar bottom sheet.
   - Added explicit 100% width and safe keyboard container pointer events to prevent horizontal collapse inside native dialogs.
   - Guarded sequential dialog transitions with safe window token release delays.

3. **Bugs Screen Unwanted Top Header Space Removed**:
   - Completely eliminated the empty black gap between the Android status bar and the "Bugs" header.
   - Replaced empty large header top-bar allocation with a compact, unified header matching the Tasks screen with safe status-bar insets.
   - Implemented a universal guard in \`LargeHeader\` so no screen renders an empty 44pt header container when trailing/back slots are absent.

4. **Metro Bundler File-Watcher Optimization on Windows**:
   - Narrowed Metro watch folders to \`packages\` and \`node_modules\`, preventing file-watcher timeouts across the monorepo on Windows machines and enabling instant hot reloads during local testing.

### Production Deployments:
- **Web App**: Live at https://doit-web.samyukt.pro
- **API Backend**: Live at https://doit.samyukt.pro/api/v1
- **Release APK**: \`DoIt-v0.2.6-build26.apk\` (attached below with SHA256 checksum)
`;

async function main() {
  console.log('1. Checking release APK artifact...');
  if (!fs.existsSync(APK_SOURCE)) {
    console.error('APK source does not exist yet at:', APK_SOURCE);
    process.exit(1);
  }

  // Ensure release-builds dir exists
  fs.mkdirSync('K:/Doit/release-builds', { recursive: true });

  console.log('2. Copying APK to release-builds/DoIt-v0.2.6-build26.apk...');
  fs.copyFileSync(APK_SOURCE, APK_TARGET);

  console.log('3. Computing SHA256 checksum...');
  const apkBuffer = fs.readFileSync(APK_TARGET);
  const hash = crypto.createHash('sha256').update(apkBuffer).digest('hex');
  fs.writeFileSync(SHA_TARGET, `${hash}  DoIt-v0.2.6-build26.apk\n`, 'utf-8');
  console.log('SHA256:', hash);

  console.log('4. Creating GitHub Release via gh CLI...');
  const tempNotesFile = 'K:/Doit/release-notes-26.md';
  fs.writeFileSync(tempNotesFile, RELEASE_BODY, 'utf-8');

  try {
    const cmd = `gh release create "${TAG}" "${APK_TARGET}" "${SHA_TARGET}" --title "${RELEASE_NAME}" --notes-file "${tempNotesFile}" --target main --latest`;
    console.log('Executing:', cmd);
    const out = execSync(cmd, { stdio: 'pipe' }).toString();
    console.log('Release created successfully:\n', out);
  } catch (err) {
    console.error('gh release create failed:', err.message, err.stderr?.toString());
    process.exit(1);
  } finally {
    if (fs.existsSync(tempNotesFile)) {
      fs.unlinkSync(tempNotesFile);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
