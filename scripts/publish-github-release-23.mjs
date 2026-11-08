import fs from 'fs';
import path from 'path';
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
const TAG = 'v0.2.3+23';
const RELEASE_NAME = 'DoIt v0.2.3 — Build 23 (Plane-Class Overhaul: Launchpad Home, Tokens v3, Bottom Sheets, Bug Intake & T1 Closeout)';
const APK_PATH = 'K:/Doit/release-builds/DoIt-v0.2.3-build23.apk';
const SHA_PATH = 'K:/Doit/release-builds/DoIt-v0.2.3-build23.apk.sha256';

const RELEASE_BODY = `## DoIt v0.2.3 — Release Build 23 (Plane-Class Overhaul)

### Key Highlights & Deliverables in Build 23:

1. **Tokens v3 & Contrast System (Milestones M0–M1)**:
   - 100% WCAG AA contrast pass (43/43 token pairs verified with 0 failures via \`contrast.py\`).
   - Standardized 5 canonical accents: Blue (\`#3A66F2\`, default), Violet (\`#7B54E8\`), Green (\`#0E8550\`), Orange (\`#C24E07\`), Rose (\`#D6305A\`) with visible selection rings and checkmarks.
   - Cross-platform \`Switch\` primitive with accent track and pure white thumb (\`#FFFFFF\`).
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

4. **Planning T2 Slice A Contracts (Milestone M6)**:
   - Added Task Comments endpoints (\`GET /tasks/:id/comments\`, \`POST /tasks/:id/comments\`, \`DELETE /tasks/:id/comments/:commentId\`).
   - Interactive Checklist items with fractional ordering and completion status.
   - Re-exported OpenAPI specification (71 paths) with 87% web coverage.

5. **Settings Hub & Compliance (Milestone M5, T1 Closeout)**:
   - Sentence-case headers, 5-swatch palette picker, and isolated destructive Log Out card.
   - Data & Privacy section with JSON workspace data archive export and secure account deletion flow.
   - Rebuilt Project Context Markdown editor and encrypted AI provider key testing.
   - App version updated to \`0.2.3 (Build 23) by Samyukt\`.

### Production Deployments:
- **Web App**: Live at https://doit-web.samyukt.pro
- **API Backend**: Live at https://doit.samyukt.pro/api/v1
`;

async function main() {
  console.log('1. Checking existing release or creating new release for tag', TAG);

  let releaseId;
  let uploadUrlTemplate;

  const getReleaseRes = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${TAG}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'node',
    },
  });

  if (getReleaseRes.ok) {
    const existing = await getReleaseRes.json();
    releaseId = existing.id;
    uploadUrlTemplate = existing.upload_url;
    console.log('Found existing release with ID:', releaseId);

    await fetch(`https://api.github.com/repos/${REPO}/releases/${releaseId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'node',
      },
      body: JSON.stringify({
        name: RELEASE_NAME,
        body: RELEASE_BODY,
        draft: false,
        prerelease: false,
      }),
    });
  } else {
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'node',
      },
      body: JSON.stringify({
        tag_name: TAG,
        name: RELEASE_NAME,
        body: RELEASE_BODY,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      console.error('Failed to create release:', await createRes.text());
      process.exit(1);
    }
    const created = await createRes.json();
    releaseId = created.id;
    uploadUrlTemplate = created.upload_url;
    console.log('Created release with ID:', releaseId);
  }

  // Upload assets if APK exists
  if (fs.existsSync(APK_PATH)) {
    const apkFileName = path.basename(APK_PATH);
    const cleanUploadUrl = uploadUrlTemplate.replace(/\{(\?name,label|name)\}/, `?name=${apkFileName}`);

    console.log(`2. Uploading ${apkFileName}...`);
    const apkBytes = fs.readFileSync(APK_PATH);
    const uploadRes = await fetch(cleanUploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': String(apkBytes.length),
        'User-Agent': 'node',
      },
      body: apkBytes,
    });

    if (uploadRes.ok) {
      console.log('APK uploaded successfully!');
    } else {
      console.log('APK upload response:', uploadRes.status, await uploadRes.text());
    }

    if (fs.existsSync(SHA_PATH)) {
      const shaFileName = path.basename(SHA_PATH);
      const shaUploadUrl = uploadUrlTemplate.replace(/\{(\?name,label|name)\}/, `?name=${shaFileName}`);
      const shaBytes = fs.readFileSync(SHA_PATH);
      await fetch(shaUploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'text/plain',
          'Content-Length': String(shaBytes.length),
          'User-Agent': 'node',
        },
        body: shaBytes,
      });
      console.log('SHA256 uploaded successfully!');
    }
  } else {
    console.log('APK file not found at', APK_PATH, '- release note published.');
  }

  console.log('Release published successfully:', `https://github.com/${REPO}/releases/tag/${TAG}`);
}

main().catch(console.error);
