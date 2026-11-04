import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+15';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 15 (Repeated Screenshot Captures Fix, Borderless UI & Project/Label Management)';
const APK_PATH = 'K:/Doit/DoIt-v0.1.0-build15.apk';
const SHA_PATH = 'K:/Doit/DoIt-v0.1.0-build15.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 15

### Key Fixes & Enhancements in Build 14:

1. **Repeated Screenshot Capture Lifecycle Resolved Permanently**:
   - Fixed \`ScreenCaptureManager\` state machine preventing subsequent captures from locking or glitching.
   - Decoupled image decoding and file writing from UI thread to dedicated background executor.
   - Removed stale static activity callback reference that caused attempt 2 to fail when attempt 1's \`onDestroy()\` fired.
   - Implemented automatic silent fallback with rate-limit tracking for rapid consecutive captures.
   - Guaranteed \`isSubmitting = false\` in bubble submission error paths so overlay bubbles never lock up.

2. **Avatar & Workspace Touch Targets & Navigation**:
   - Pinned top header bar outside of the ScrollView to prevent scrolling gestures from intercepting menu taps.
   - Increased Avatar touch target to 44×44pt with 16pt hitSlop and added \`pointerEvents="none"\` on child views.
   - Expanded Workspace selector touch target with 44pt minimum height and 10pt hitSlop.

3. **Projects & Labels Management Added**:
   - Integrated \`ProjectSwitcherSheet\` directly into the Account Menu Sheet and HomeScreen for switching and creating projects on the fly.
   - Created dedicated \`LabelManagerSheet\` with preset color picker and real-time backend sync (\`POST/GET /workspaces/:id/labels\`).

4. **Complete Borderless UI (L0–L7) Implementation**:
   - Full borderless UI system live with zero static 1px borders, subtle elevation glows, circular checkboxes, and unified typography.

### Downloads:
- **APK**: \`DoIt-v0.1.0-build15.apk\` (35.8 MB)
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

  const uploadUrlTemplate = releaseData.upload_url; // e.g. https://uploads.github.com/repos/owner/repo/releases/id/assets{?name,label}
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
