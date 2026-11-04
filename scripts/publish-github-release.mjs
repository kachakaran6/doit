import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+18';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 18 (Anchored In-Tree Dropdown Sheets, Profile Context Menu Fix & Project/Label Quick Chips)';
const APK_PATH = 'K:/Doit/release-builds/DoIt-v0.1.0-build18.apk';
const SHA_PATH = 'K:/Doit/release-builds/DoIt-v0.1.0-build18.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 18

### Key Fixes & Enhancements in Build 18:

1. **Anchored In-Tree Dropdown Overlays (Profile & Context Menus)**:
   - Replaced native Android \`<Modal>\` dialogs with precision in-tree dropdown overlays (\`StyleSheet.absoluteFillObject\` with backdrop).
   - Resolved touch release cancellation (\`Got DOWN touch before receiving UP or CANCEL\`) that was causing Android to dismiss the profile menu immediately on touch release.
   - Pinned the Account/Profile context menu directly below the top-right user avatar (\`top: 68, right: 16\`).
   - Pinned the Workspace Switcher directly below the top-left workspace selector.

2. **Dedicated Project & Label Quick-Chips**:
   - Added project selector and label manager chips directly to the top sub-bar of HomeScreen.
   - Auto-generates valid uppercase project keys matching backend schema validation.
   - Preset backend-compatible color palette (\`INDIGO\`, \`TEAL\`, \`AMBER\`, \`ROSE\`, \`VIOLET\`) for real-time label creation and sync.

3. **Build & CI Pipeline Upgrades**:
   - Fixed GitHub Actions CI to use Node.js 22 with pnpm 11+ and pre-generated Prisma client.
   - Fixed Metro bundler Windows memory allocation by setting \`maxWorkers: 2\` and \`--max-old-space-size=4096\`.

4. **Complete Borderless UI (L0–L7) Implementation**:
   - Full borderless UI system live with zero static 1px borders, subtle elevation glows, circular checkboxes, and unified typography.

### Downloads:
- **APK**: \`DoIt-v0.1.0-build18.apk\` (35.9 MB)
`;

async function main() {
  console.log('1. Checking existing release or creating new release for tag', TAG);

  const getReleaseRes = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${TAG}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'User-Agent': 'DoIt-Release-Uploader',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  let releaseData;
  if (getReleaseRes.status === 200) {
    releaseData = await getReleaseRes.json();
    console.log('Found existing release with ID:', releaseData.id);
  } else {
    console.log('Creating new GitHub Release...');
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
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
      const err = await createRes.text();
      console.error('Failed to create release:', createRes.status, err);
      process.exit(1);
    }

    releaseData = await createRes.json();
    console.log('Created release with ID:', releaseData.id);
  }

  const uploadUrlTemplate = releaseData.upload_url;
  const cleanUploadUrl = uploadUrlTemplate.replace(/\{\?name,label\}/, '');

  async function uploadAsset(filePath, mimeType) {
    const fileName = path.basename(filePath);
    const fileStats = fs.statSync(filePath);
    console.log(`\nUploading ${fileName} (${fileStats.size} bytes)...`);

    // Check if asset already exists in release
    const existingAsset = releaseData.assets?.find(a => a.name === fileName);
    if (existingAsset) {
      console.log(`Asset ${fileName} already exists (ID: ${existingAsset.id}). Deleting old asset...`);
      await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'User-Agent': 'DoIt-Release-Uploader',
        },
      });
    }

    const fileStream = fs.readFileSync(filePath);
    const uploadRes = await fetch(`${cleanUploadUrl}?name=${encodeURIComponent(fileName)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
        'Content-Type': mimeType,
        'Content-Length': fileStats.size.toString(),
      },
      body: fileStream,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error(`Failed to upload ${fileName}:`, uploadRes.status, errText);
      process.exit(1);
    }

    const uploadedData = await uploadRes.json();
    console.log(`✓ Uploaded ${fileName}: ${uploadedData.browser_download_url}`);
  }

  await uploadAsset(APK_PATH, 'application/vnd.android.package-archive');
  await uploadAsset(SHA_PATH, 'text/plain');

  console.log('\nAll assets published successfully to GitHub Release:', releaseData.html_url);
}

main().catch(console.error);
