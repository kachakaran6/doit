import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+13';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 13 (Silent Instant Screenshots & Accessibility Service)';
const APK_PATH = 'K:/Doit/DoIt-v0.1.0-build13.apk';
const SHA_PATH = 'K:/Doit/DoIt-v0.1.0-build13.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 13 (Silent Instant Screenshots)

### Major New Features & Fixes in this Release:

1. **DoIt Accessibility Service (Silent 1-Tap Screenshots)**:
   - Added \`DoItAccessibilityService\` using the Android 11+ \`AccessibilityService.takeScreenshot\` API.
   - **ZERO system popups**: Completely eliminates the system confirmation bottom sheet (\`"Start recording or casting with DoIt?"\`) when capturing from the floating bubble or shake over other apps (Snapchat, games, home screen).
   - Instant capture in ~10ms with zero dialogs.
   - Added 1-tap "Enable Silent Instant Capture" banner and toggle in **Settings → Quick Capture & Hardware Integration**.
   - Automatic fallback to \`MediaProjection\` if Accessibility is not yet granted.

2. **Android 14/15/16 MediaProjection Callback Enforcement**:
   - Registered mandatory \`MediaProjection.Callback\` prior to invoking \`createVirtualDisplay\`.
   - Added \`foregroundServiceType="specialUse|mediaProjection"\` in \`AndroidManifest.xml\`.

3. **CompleteUpload Target Schema Bug Fix (Screenshots on Bugs)**:
   - Fixed \`CompleteUploadSchema\` validation failure. Both tasks and bugs now link strictly via \`taskId: createdId\`, displaying screenshots properly under **ATTACHMENTS** in Bug Detail and Task Detail.

4. **Instant In-App Screenshot**:
   - In-app screenshot uses hardware \`PixelCopy\` on the UI thread (<25ms) with zero permission prompts.

5. **P-01 Primitives & P-02 Shell Architecture**:
   - Full implementation of all Design System primitives and shell frame components.

### Download:
- **APK**: \`DoIt-v0.1.0-build13.apk\`
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
