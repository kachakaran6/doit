import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+10';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 10 (Screenshot Upload Fix, Move to Trash, Workspace Fix)';
const APK_PATH = 'K:/Doit/DoIt-v0.1.0-build10.apk';
const SHA_PATH = 'K:/Doit/DoIt-v0.1.0-build10.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 10

### Key Fixes & Features Delivered:

1. **Native Quick-Capture & Shake Screenshot Upload**:
   - Fixed taskId extraction in native \`BubbleService.kt\` when submitting tasks/bugs via the floating bubble or shake capture. Now safely reads \`jsonResp.getJSONObject("task").optString("id")\`.
   - Guaranteed upload and association of screenshot attachments directly to created Tasks and Bugs.
   - Attachments render cleanly in Task Detail and Bug Detail with high-resolution thumbnail and tap-to-expand modal viewer.

2. **Move Card to Trash**:
   - Added \`useDeleteTaskMutation\` and \`useDeleteBugMutation\` communicating with \`DELETE /tasks/:id\`.
   - Added a red **"Move to Trash"** button with destructive confirmation dialog in both Task Detail and Bug Detail screens.
   - Added a quick-access Trash icon in the screen header.
   - Verified end-to-end task deletion on physical Android device.

3. **Workspace Creation Fix**:
   - Fixed \`WorkspacesService.create\` to auto-generate unique collision-free slugs and automatically create the default \`General\` project (\`GEN\`) with \`projects: true\`.
   - Prevents the "Project not found" error when creating tasks or bugs in newly created workspaces.
   - Refined \`WorkspaceSwitcherSheet\` with \`KeyboardAvoidingView\`, flexible scrolling, and keyboard done action so Create/Cancel buttons are never clipped.

4. **DoIt Premium UI Kit — Foundation (P-00)**:
   - 4-step surface ladder (L0: \`#08090A\`, L1: \`#0F1012\`, L2: \`#16181B\`, L3: \`#1D2024\`).
   - Optical typography scale with computed size-specific tracking, tabular numerals, and Inter 400/500/600 font family.
   - \`Surface\` component with 1px top highlight and zero card borders.
   - \`FoundationGallery\` developer screen reachable via deep link \`samyukt://dev/foundation\` and Settings screen.

### Download:
- **APK**: \`DoIt-v0.1.0-build10.apk\`
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
        target_commitish: 'main',
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
    releaseData = await createRes.json();
    console.log(`Created release successfully: ID ${releaseData.id}`);
  }

  const uploadUrlTemplate = releaseData.upload_url;
  const uploadBaseUrl = uploadUrlTemplate.split('{')[0];

  console.log('2. Preparing assets to upload...');
  const filesToUpload = [
    { name: path.basename(APK_PATH), path: APK_PATH, contentType: 'application/vnd.android.package-archive' },
    { name: path.basename(SHA_PATH), path: SHA_PATH, contentType: 'text/plain' },
  ];

  for (const asset of releaseData.assets || []) {
    console.log(`Checking existing asset: ${asset.name} (ID: ${asset.id})`);
    for (const file of filesToUpload) {
      if (asset.name === file.name) {
        console.log(`Deleting old asset ${asset.name}...`);
        await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${asset.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'User-Agent': 'DoIt-Release-Uploader',
          },
        });
      }
    }
  }

  for (const file of filesToUpload) {
    if (!fs.existsSync(file.path)) {
      console.error(`File does not exist: ${file.path}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(file.path);
    const uploadUrl = `${uploadBaseUrl}?name=${encodeURIComponent(file.name)}`;
    console.log(`Uploading ${file.name} (${fileBuffer.length} bytes)...`);

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
        'Content-Type': file.contentType,
        'Content-Length': fileBuffer.length.toString(),
      },
      body: fileBuffer,
    });

    if (uploadRes.ok) {
      const uploadedData = await uploadRes.json();
      console.log(`✔ Successfully uploaded ${file.name} (ID: ${uploadedData.id}, Download: ${uploadedData.browser_download_url})`);
    } else {
      const err = await uploadRes.text();
      console.error(`✖ Failed to upload ${file.name}:`, uploadRes.status, err);
    }
  }

  console.log('All done! Release is live at:', releaseData.html_url);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
