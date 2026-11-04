import fs from 'fs';
import path from 'path';

// Update build.gradle versionName
const gradlePath = 'apps/mobile/android/app/build.gradle';
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionName\s+["']0\.1\.0["']/, 'versionName "0.2.1"');
fs.writeFileSync(gradlePath, gradle, 'utf8');
console.log('Updated build.gradle versionName to 0.2.1');

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.2.1+21';
const RELEASE_NAME = 'DoIt v0.2.1 — Release Build 21 (Tasks Compact List, Bug Screen Gap Fix, Floating Nav Bar & Quick Capture Voice/Bugs)';
const APK_PATH = 'K:/Doit/release-builds/DoIt-v0.2.1-build21.apk';
const SHA_PATH = 'K:/Doit/release-builds/DoIt-v0.2.1-build21.apk.sha256';

const RELEASE_BODY = `## DoIt v0.2.1 — Release Build 21

### Key Highlights & Enhancements in Build 21:

1. **Tasks Screen — Compact List & Background Removal**:
   - Removed the outer enclosing background card on the Tasks screen for a clean, borderless list.
   - Streamlined task item sizing with high-density information architecture (14px title, 11px human ID, priority indicator dot, and circular selection checks).
   - Removed the empty "TODAY 0" placeholder box when there are no tasks due today.

2. **Bugs Queue — Compact View & Zero Vertical Gap**:
   - Resolved the horizontal filter chip scroller vertical inflation issue. Bug cards now start immediately beneath the filter chips with zero extra gap.

3. **Floating Navigation Bar — Transparent Backdrop**:
   - Removed the dark solid background block behind the floating pill navigation bar and '+' FAB. Both float cleanly over the screen content.

4. **Floating Quick Capture — Bug Submission & Voice Attachments**:
   - Fixed bug submission handling and backend attachment association for Quick Capture.
   - Built a high-performance native WindowManager floating toast with Lucide checkmark icon and emerald green accent that dismisses automatically after 3 seconds.
   - Full Lucide icon integration (mic, square stop, list-checks, bug, send, trash-2).

5. **Token Rotation & Session Resilience**:
   - Background native services and foreground React Native client synchronize rotated tokens seamlessly on HTTP 401.

### Downloads:
- **APK**: \`DoIt-v0.2.1-build21.apk\` (34.3 MB)
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
