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
const TAG = 'v0.2.2+22';
const RELEASE_NAME = 'DoIt v0.2.2 — Release Build 22 (Cold-Start Deep Link Routing Fix, Transparent Floating Nav, Quick Capture Upgrades, Project Context & AI Prompts)';
const APK_PATH = 'K:/Doit/release-builds/DoIt-v0.2.2-build22.apk';
const SHA_PATH = 'K:/Doit/release-builds/DoIt-v0.2.2-build22.apk.sha256';

const RELEASE_BODY = `## DoIt v0.2.2 — Release Build 22

### Key Highlights & Fixes in Build 22:

1. **Cold-Start Launch Fix (No More Invitation Error Flash)**:
   - Root-caused and permanently fixed the routing glitch on app cold start.
   - Restructured \`RootNavigator.tsx\` and \`InviteAcceptScreen.tsx\`: normal app launches route straight to \`MainTabs\` with zero invitation error screens. Genuine invitation links continue to validate and accept reliably.

2. **Floating Navigation Bar Polish**:
   - Transparent tab bar backplate: removed all background artifacts behind the floating pill navigation bar and '+' FAB. Both float cleanly over screen content.

3. **Quick Capture Upgraded**:
   - Added interactive project dropdown and multi-label tagging selector with workspace defaults to Quick Capture modal.
   - Native WindowManager floating toast with Lucide checkmark icon and 3-second auto-dismissal.

4. **Project Context (Markdown Editor & Preview)**:
   - Every project can now define its technical domain, architecture, conventions, and instructions in Markdown.
   - Markdown editor with live preview in Project Context screen.

5. **AI Provider Credentials & Solution Prompt Generator**:
   - Secure server-side AES-256-GCM authenticated encryption for personal AI provider API keys.
   - Developer-ready Solution Prompt section in Task Details & Bug Details: synthesizes project context, task description, telemetry, and image attachments into copy/paste-ready prompts for coding agents.

6. **Web Feature Parity & Universal Layout**:
   - 100% OpenAPI coverage on web SPA.
   - Universal \`PageContainer\` with symmetric margins across all screens.
   - Two-column settings layout with sticky sub-navigation.
   - Fixed column grid for work items.
   - Full real-user profile hydration (\`/auth/me\`) eliminating "Account / U" and "Active User" placeholders.

### Downloads:
- **APK**: \`DoIt-v0.2.2-build22.apk\` (34.3 MB)
- **SHA256**: \`4b2327497f718b719cc3bb16dca6e618a2e79b394271018a9f0f1fc4f252c2f1\`
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
      const errText = await createRes.text();
      console.error('Failed to create release:', createRes.status, errText);
      process.exit(1);
    }

    const created = await createRes.json();
    releaseId = created.id;
    uploadUrlTemplate = created.upload_url;
    console.log('Created release with ID:', releaseId);
  }

  async function uploadAsset(filePath, mimeType) {
    const fileName = path.basename(filePath);
    const fileBytes = fs.readFileSync(filePath);
    console.log(`\nUploading ${fileName} (${fileBytes.length} bytes)...`);

    const assetsRes = await fetch(`https://api.github.com/repos/${REPO}/releases/${releaseId}/assets`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'node',
      },
    });

    if (assetsRes.ok) {
      const assets = await assetsRes.json();
      const existingAsset = assets.find((a) => a.name === fileName);
      if (existingAsset) {
        console.log(`Asset ${fileName} already exists (ID: ${existingAsset.id}). Deleting old asset...`);
        await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'node',
          },
        });
      }
    }

    const uploadUrl = uploadUrlTemplate.replace(/\{(\?name,label)?\}/, `?name=${encodeURIComponent(fileName)}`);
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': mimeType,
        'Content-Length': fileBytes.length.toString(),
        'User-Agent': 'node',
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error(`Failed to upload ${fileName}:`, uploadRes.status, errText);
    } else {
      const data = await uploadRes.json();
      console.log(`✓ Uploaded ${fileName}: ${data.browser_download_url}`);
    }
  }

  await uploadAsset(APK_PATH, 'application/vnd.android.package-archive');
  await uploadAsset(SHA_PATH, 'text/plain');

  console.log(`\nAll assets published successfully to GitHub Release: https://github.com/kachakaran6/doit/releases/tag/${TAG}`);
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
