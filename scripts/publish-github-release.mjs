import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+6';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 6 (Task & Bug Attachment Gallery & Detail Rendering)';
const APK_PATH = 'K:/Doit/DoIt-v0.1.0-build6.apk';
const SHA_PATH = 'K:/Doit/DoIt-v0.1.0-build6.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 6

### What's New & Fixed
- **Task & Bug Detail Attachment Gallery**:
  - Implemented reusable, theme-aligned \`AttachmentGallery\` component in both Task Detail and Bug Detail screens.
  - Image thumbnails with loading spinner, aspect ratio preservation, rounded corners, and subtle borders.
  - Tap any thumbnail to open the smooth **Full-Screen Image Viewer Modal** with high-resolution view, file dimensions, file size, MIME type, and quick close.
- **Backend Storage URL Generation**:
  - Injected \`StorageService\` into \`TasksService.findOne\`.
  - Generates authenticated signed URLs (\`url\` and \`thumbUrl\`) for all attachments on Tasks and Bugs.
- **Attachment Association Fix**:
  - Mapped \`bugId\` and \`taskId\` in \`AttachmentsService.completeUpload\` to eliminate foreign key mismatch, ensuring bug attachments are permanently attached to the corresponding Task record.
- **Native Binary File Upload**:
  - Added native streaming \`uploadFile\` in \`OverlayServiceModule\` so React Native streams files directly to presigned PUT URLs without bridge blob crashes on Android.
- **Target Backend**:
  - Pointed strictly to \`https://doit.samyukt.pro/api/v1\`.

### Download
- **APK**: \`DoIt-v0.1.0-build6.apk\` (~35 MB)
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
  console.log('2. Uploading DoIt-v0.1.0-build6.apk...');
  const apkBytes = fs.readFileSync(APK_PATH);
  const apkName = 'DoIt-v0.1.0-build6.apk';

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
    const shaName = 'DoIt-v0.1.0-build6.apk.sha256';

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
