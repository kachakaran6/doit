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
const TAG = 'v0.2.5+25';
const RELEASE_NAME = 'DoIt v0.2.5 — Build 25 (Task Checkbox Completion Fix, Modal Bottom Sheets, Task Status & Label Pickers, Web Switcher Stability)';
const APK_SOURCE = 'K:/Doit/apps/mobile/android/app/build/outputs/apk/release/app-release.apk';
const APK_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.5-build25.apk';
const SHA_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.5-build25.apk.sha256';

const RELEASE_BODY = `## DoIt v0.2.5 — Release Build 25

### Critical Fixes & Improvements in Build 25:

1. **Task Completion & Status Machine (Critical Fix)**:
   - Fixed task checkbox completion bug where checking a task did not update the database. Aligned client mutation with \`PATCH /tasks/:id/status\` state machine endpoint.
   - Implemented optimistic UI updates with automatic rollback on network failure, eliminating UI bounce.
   - Isolated touch propagation on the \`Checkbox\` component (\`e.stopPropagation()\`) to ensure tapping the tick toggle doesn't trigger row navigation.
   - Added disabled state while mutation is pending to prevent duplicate submission.
   - Added legal transition validation (\`validateStatusTransition\`) across both status-specific and generic update endpoints in \`apps/api\`.

2. **Native Modal Bottom Sheets & Navigation Bar Isolation**:
   - Rebuilt \`WorkspaceSwitcherSheet\`, \`ProjectSwitcherSheet\`, \`AccountMenuSheet\`, and \`LabelManagerSheet\` as native React Native \`<Modal>\` components on the native Window layer.
   - Completely resolved clipping by Android navigation bars (gesture bar & 3-button nav) using dynamic \`useSafeAreaInsets\`.
   - Guaranteed full-height scrollability so bottom actions ("Sign Out", "New Workspace", "Join with Code") are completely reachable without obstruction.
   - Floating navigation bar is positioned behind the modal backdrop and cannot receive touches or render above open sheets.

3. **Task Detail Workflow & Label Management**:
   - Added interactive Task Status Picker sheet supporting all 4 backend statuses (\`TODO\`, \`IN_PROGRESS\`, \`BLOCKED\`, \`DONE\`) with legal state indicators.
   - Added real Workspace Label selector and Manager sheet linked to \`POST /tasks/:id/labels\`.

4. **Web Layout Stability**:
   - Fixed Workspace Switcher width jump: locked to stable \`w-[170px] sm:w-[185px]\` with clean text truncation.
   - Removed redundant duplicate page title headers across Overview, Tasks, Bugs, Stickies, and Team pages, standardizing on topbar breadcrumb navigation.

### Production Deployments:
- **Web App**: Live at https://doit-web.samyukt.pro
- **API Backend**: Live at https://doit.samyukt.pro/api/v1
- **Release APK**: \`DoIt-v0.2.5-build25.apk\` (attached below with SHA256 checksum)
`;

async function main() {
  console.log('1. Checking release APK artifact...');
  if (!fs.existsSync(APK_SOURCE)) {
    console.error('APK source does not exist yet at:', APK_SOURCE);
    process.exit(1);
  }

  // Ensure release-builds dir exists
  fs.mkdirSync('K:/Doit/release-builds', { recursive: true });

  console.log('2. Copying APK to release-builds/DoIt-v0.2.5-build25.apk...');
  fs.copyFileSync(APK_SOURCE, APK_TARGET);

  console.log('3. Computing SHA256 checksum...');
  const apkBuffer = fs.readFileSync(APK_TARGET);
  const hash = crypto.createHash('sha256').update(apkBuffer).digest('hex');
  fs.writeFileSync(SHA_TARGET, `${hash}  DoIt-v0.2.5-build25.apk\n`, 'utf-8');
  console.log('SHA256:', hash);

  console.log('4. Creating GitHub Release via gh CLI...');
  const tempNotesFile = 'K:/Doit/release-notes-25.md';
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

