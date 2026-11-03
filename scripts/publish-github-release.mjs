import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+5';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 5 (Instant Screenshot & Workspace Fixes)';
const APK_PATH = 'K:/Doit/DoIt-v0.1.0-build5.apk';
const SHA_PATH = 'K:/Doit/DoIt-v0.1.0-build5.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 5

### What's New & Fixed
- **Instant In-App Screenshot (Zero Prompts / Zero Popups)**:
  - Replaced MediaProjection inside DoIt app with hardware-accelerated Android \`PixelCopy\` API on the activity window.
  - Tapping "Capture Screen" inside DoIt now captures the view in ~15ms with **ZERO system dialogs**, **no casting prompt**, and **no app selection picker**.
- **Android 14 (API 34) Direct Display Capture**:
  - When capturing outside the app, configured \`MediaProjectionConfig.createConfigForDefaultDisplay()\`.
  - Eliminates the confusing "Choose app to share" system sub-flow on Android 14.
- **Background Capture Modal Checkbox**:
  - The "Attach current screen screenshot" checkbox now defaults to **unchecked** (\`false\`) in the compact quick capture overlay.
  - Submitting quick tasks or bugs outside DoIt is instant without triggering any screen cast dialog unless the user intentionally chooses to attach a screenshot.
- **Smart Floating Bubble Visibility**:
  - Automatically hides the floating bubble overlay whenever the DoIt application is active in the foreground (\`onResume\`) so it never overlaps or obstructs input fields.
  - Automatically restores the floating bubble when the user switches to other apps or the home screen.
- **Fixed "Project Not Found" (404) Error**:
  - Backend resilience: \`TasksService\` and \`StickiesService\` now auto-resolve the user's workspace project or create a default project (\`General\`, key: \`GEN\`) if none exists, preventing any 404 failure.
  - Guard resilience: \`WorkspaceMemberGuard\` handles \`default\` and unknown project IDs gracefully by falling back to the user's workspace membership.
  - Frontend auto-initialization: \`useWorkspaceStore\` now auto-fetches \`/workspaces\` with projects upon app launch and login, ensuring \`activeProject\` is always populated.
  - Background overlay: \`BubbleService\` now auto-resolves the user's project ID from \`/workspaces\`.
- **Target Backend**:
  - Pointed strictly to \`https://doit.samyukt.pro/api/v1\`.

### Download
- **APK**: \`DoIt-v0.1.0-build5.apk\` (~35 MB)
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
  console.log('2. Uploading DoIt-v0.1.0-build5.apk...');
  const apkBytes = fs.readFileSync(APK_PATH);
  const apkName = 'DoIt-v0.1.0-build5.apk';

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

  const uploadApkRes = await fetch(`${uploadBaseUrl}?name=${apkName}`, {
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
  console.log(`APK uploaded successfully! Download URL: ${apkAsset.browser_download_url}`);

  // Upload SHA-256
  if (fs.existsSync(SHA_PATH)) {
    console.log('3. Uploading SHA-256 checksum...');
    const shaBytes = fs.readFileSync(SHA_PATH);
    const shaName = 'DoIt-v0.1.0-build5.apk.sha256';

    const existingSha = releaseData.assets?.find((a) => a.name === shaName);
    if (existingSha) {
      console.log(`Deleting existing asset ${shaName}...`);
      await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingSha.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'User-Agent': 'DoIt-Release-Uploader',
        },
      });
    }

    const uploadShaRes = await fetch(`${uploadBaseUrl}?name=${shaName}`, {
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
      console.log('SHA-256 uploaded successfully!');
    }
  }

  console.log('=== Release complete ===');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
