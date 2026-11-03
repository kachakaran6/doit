import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+4';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 4 (Compact Bubble & Background Shake Capture)';
const APK_PATH = 'K:/Doit/DoIt-v0.1.0-build4.apk';
const SHA_PATH = 'K:/Doit/DoIt-v0.1.0-build4.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 4

### What's New & Fixed
- **44dp Compact Floating Quick Capture Bubble**:
  - Uses the official application icon (\`ic_launcher_round\`) in a sleek 44dp circular container with 1.5dp Indigo border.
  - Resolved oversized 56dp canvas checkmark.
- **Background Shake Detection Outside DoIt**:
  - Embedded native accelerometer \`SensorEventListener\` directly into the Android foreground service (\`BubbleService\`).
  - Works continuously outside DoIt (e.g. while playing games or browsing) without being frozen by React Native background activity pausing.
- **Shake Choice Prompt**:
  - Deliberate wrist flick outside DoIt presents a compact choice dialog:
    - 🐞 **Report a Bug**
    - 📝 **Create a Task**
    - **Cancel**
- **Compact Quick Capture Modal Overlay**:
  - Tapping the floating bubble or picking from the shake prompt opens a native floating overlay over other applications without pulling the user away from their active app.
  - Header with title, type toggle (Task / Bug), close button.
  - Multiline capture input.
  - Clean screenshot checkbox.
- **Clean Screenshot Capture (Excluding Overlays)**:
  - Automatically hides all DoIt overlay views (\`View.GONE\`).
  - Waits 150ms for SurfaceFlinger hardware compositing so the resulting image has **zero** DoIt overlay artifacts.
- **In-App Capture Form Attachments**:
  - New reusable \`AttachmentSection\` in Task, Bug, Sticky, and Voice capture forms.
  - Supports screen captures and gallery images with thumbnails and file size.
- **Backend Sync**:
  - Pointed strictly to \`https://doit.samyukt.pro/api/v1\`.

### Download
- **APK**: \`DoIt-v0.1.0-build4.apk\` (~35 MB)
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

  let releaseData = null;
  if (getReleaseRes.ok) {
    releaseData = await getReleaseRes.json();
    console.log(`Found existing release: ID ${releaseData.id}`);
  } else {
    console.log('Creating new release...');
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
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
      throw new Error(`Failed to create release: ${createRes.status} ${err}`);
    }

    releaseData = await createRes.json();
    console.log(`Created release successfully: ID ${releaseData.id}`);
  }

  const uploadUrlTemplate = releaseData.upload_url;
  const uploadBaseUrl = uploadUrlTemplate.split('{')[0];

  // Upload APK
  console.log('2. Uploading DoIt-v0.1.0-build4.apk...');
  const apkBytes = fs.readFileSync(APK_PATH);
  const apkName = 'DoIt-v0.1.0-build4.apk';

  // Check if asset already exists
  const existingAsset = releaseData.assets?.find((a) => a.name === apkName);
  if (existingAsset) {
    console.log(`Deleting existing asset ${apkName} (ID ${existingAsset.id})...`);
    await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
      },
    });
  }

  const uploadApkRes = await fetch(`${uploadBaseUrl}?name=${encodeURIComponent(apkName)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'User-Agent': 'DoIt-Release-Uploader',
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': apkBytes.length.toString(),
    },
    body: apkBytes,
  });

  if (!uploadApkRes.ok) {
    const err = await uploadApkRes.text();
    throw new Error(`Failed to upload APK: ${uploadApkRes.status} ${err}`);
  }

  const apkAsset = await uploadApkRes.json();
  console.log(`APK uploaded successfully! Asset ID: ${apkAsset.id}, URL: ${apkAsset.browser_download_url}`);

  // Upload SHA256 if exists
  if (fs.existsSync(SHA_PATH)) {
    console.log('3. Uploading SHA256 file...');
    const shaBytes = fs.readFileSync(SHA_PATH);
    const shaName = 'DoIt-v0.1.0-build4.apk.sha256';

    const existingSha = releaseData.assets?.find((a) => a.name === shaName);
    if (existingSha) {
      await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingSha.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'User-Agent': 'DoIt-Release-Uploader',
        },
      });
    }

    const uploadShaRes = await fetch(`${uploadBaseUrl}?name=${encodeURIComponent(shaName)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
        'Content-Type': 'text/plain',
        'Content-Length': shaBytes.length.toString(),
      },
      body: shaBytes,
    });

    if (uploadShaRes.ok) {
      console.log('SHA256 file uploaded successfully!');
    }
  }

  console.log('\nRELEASE PUBLISHED SUCCESSFULLY:');
  console.log(releaseData.html_url);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

