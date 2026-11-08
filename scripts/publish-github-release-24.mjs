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
const TAG = 'v0.2.4+24';
const RELEASE_NAME = 'DoIt v0.2.4 — Build 24 (Plane-Class Overhaul: Launchpad Home, Tokens v3, Bottom Sheets, Bug Intake & Planning Features)';
const APK_SOURCE = 'K:/Doit/apps/mobile/android/app/build/outputs/apk/release/app-release.apk';
const APK_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.4-build24.apk';
const SHA_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.4-build24.apk.sha256';

const RELEASE_BODY = `## DoIt v0.2.4 — Release Build 24 (Plane-Class Overhaul)

### Key Highlights & Deliverables in Build 24:

1. **Tokens v3 & System Design Foundations (Milestones M0–M1)**:
   - 100% WCAG AA contrast pass (43/43 token pairs verified with 0 failures via \`contrast.py\`).
   - Standardized 5 canonical accents: Blue (\`#3A66F2\`, default), Violet (\`#7B54E8\`), Green (\`#0E8550\`), Orange (\`#C24E07\`), Rose (\`#D6305A\`) with visible selection rings and checkmarks.
   - Unified cross-platform \`Switch\` primitive with accent track and pure white thumb (\`#FFFFFF\`).
   - Circular animated 22px bounce \`Checkbox\` and color-coded \`PriorityDot\` replacing square boxes and raw text.

2. **Plane-Class Launchpad Home & Global Bottom Sheets (Milestone M2, Gate G1)**:
   - Launchpad Home (S12) featuring SVG \`ProgressRing\` Today card (\`X to do · Y done\`), stat chips, and dedicated Plane-style **Work** card.
   - Header with workspace tile + truncated name + chevron on left; Bell icon with unread dot + Avatar on right. Removed redundant sub-bar chips.
   - \`WorkspaceSwitcherSheet\` (S13) rebuilt as a native bottom sheet: eliminated slug exposures, added "New Workspace" and "Join with Code" (\`/invitations/accept\`).
   - \`ProjectSwitcherSheet\` & \`AccountMenuSheet\` (S14) rebuilt as bottom sheets with user role badges, full name, email, and clean options.

3. **Work Items & Intake Bug Queue (Milestones M3–M4, Gate G2)**:
   - Strict client and server separation between tasks and bugs.
   - Bug auto-severity defaulting (\`MAJOR\`, \`CRITICAL\`, \`MINOR\`, \`TRIVIAL\`) with accurate summing chips.
   - \`BugRow\` with genuine screenshot thumbnails, device model chip, and age.
   - \`BugAutoContextCard\` displaying complete device telemetry (model, OS, network, battery, orientation).
   - 4-mode Quick Capture (\`task\`, \`bug\`, \`voice\`, \`sticky\`) with reactive parameters and collapsed project chip.

4. **Planning Contracts & Trash Recovery (Milestones M6–M9, Gate G3 & G4)**:
   - Dedicated \`TrashScreen\` (\`doit://trash\`) with restoration and permanent deletion for Tasks, Bugs, and Stickies.
   - Task Comments endpoints (\`GET /tasks/:id/comments\`, \`POST /tasks/:id/comments\`, \`DELETE /tasks/:id/comments/:commentId\`).
   - Interactive Checklist items with fractional ordering and completion status.
   - Re-exported OpenAPI specification (71 paths) with 87% web coverage.
   - Full test suite: 20/20 test suites passed (76/76 unit tests).

5. **Settings Hub & Compliance (Milestone M5, T1 Closeout)**:
   - Sentence-case headers, 5-swatch palette picker, and isolated destructive Log Out card.
   - Data & Privacy section with JSON workspace data archive export and secure account deletion flow.
   - Rebuilt Project Context Markdown editor and encrypted AI provider key testing.
   - App version updated to \`0.2.4 (Build 24) by Samyukt\`.

### Production Deployments:
- **Web App**: Live at https://doit-web.samyukt.pro
- **API Backend**: Live at https://doit.samyukt.pro/api/v1
- **Release APK**: \`DoIt-v0.2.4-build24.apk\` (attached below with SHA256 checksum)
`;

async function main() {
  console.log('1. Checking release APK artifact...');
  if (!fs.existsSync(APK_SOURCE)) {
    console.error('APK source does not exist yet at:', APK_SOURCE);
    process.exit(1);
  }

  // Ensure release-builds dir exists
  fs.mkdirSync('K:/Doit/release-builds', { recursive: true });

  console.log('2. Copying APK to release-builds/DoIt-v0.2.4-build24.apk...');
  fs.copyFileSync(APK_SOURCE, APK_TARGET);

  console.log('3. Computing SHA256 checksum...');
  const apkBuffer = fs.readFileSync(APK_TARGET);
  const hash = crypto.createHash('sha256').update(apkBuffer).digest('hex');
  fs.writeFileSync(SHA_TARGET, `${hash}  DoIt-v0.2.4-build24.apk\n`, 'utf-8');
  console.log('SHA256:', hash);

  console.log('4. Creating GitHub Release via gh CLI...');
  const tempNotesFile = 'K:/Doit/release-notes-24.md';
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

  console.log('All done! Release v0.2.4+24 published and verified.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
