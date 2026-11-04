import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+19';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 19 (Lucide Icons, Voice Recording Quick Capture & Zero Emojis)';
const APK_PATH = 'K:/Doit/release-builds/DoIt-v0.1.0-build19.apk';
const SHA_PATH = 'K:/Doit/release-builds/DoIt-v0.1.0-build19.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 19

### Key Highlights & Enhancements in Build 19:

1. **Zero Emojis & Official Lucide Icons System**:
   - Eliminated all emojis across the floating Quick Capture modal, shake dialog, action buttons, and details.
   - Integrated official Lucide Android vector drawables: \`list-checks\`, \`bug\`, \`camera\`, \`mic\`, \`square\`, \`play\`, \`pause\`, \`trash-2\`, \`send\`, and \`x\`.
   - Pixel-perfect alignment and dynamic semantic state tinting.

2. **Native Voice Recording Attachments**:
   - Record audio notes directly inside the floating Quick Capture overlay without switching apps.
   - Dynamic microphone permission flow via \`AudioPermissionActivity\` with Android 14 \`FOREGROUND_SERVICE_MICROPHONE\` compliance.
   - Real-time elapsed duration timer, live pulsing recording state, stop button, and playback card.
   - Multi-attachment composability: text only, voice only, screenshot only, or any combination.
   - Seamless upload to \`/uploads/init\` + PUT + \`/uploads/:id/complete\` with magic-byte verification.

3. **In-App Audio Player**:
   - Integrated \`AudioAttachmentCard\` with \`expo-av\` for inline playback on Task and Bug detail screens.

4. **HomeScreen Latest-First Sorting**:
   - Tasks and bugs on the HomeScreen now sort strictly by \`createdAt\` descending, ensuring newly captured items immediately appear at the top of "Your Work".

### Downloads:
- **APK**: \`DoIt-v0.1.0-build19.apk\` (35.9 MB)
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

    // Update release details
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
    // Create new release
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

  // Helper to upload an asset
  async function uploadAsset(filePath, mimeType) {
    const fileName = path.basename(filePath);
    const fileBytes = fs.readFileSync(filePath);
    console.log(`\nUploading ${fileName} (${fileBytes.length} bytes)...`);

    // Check if asset already exists
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
